import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function createSignature(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !razorpayKeySecret) {
      console.error("[verify-razorpay-payment] Missing required server secrets");
      return jsonResponse({ error: "Payment service is not configured" }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const token = authorization.slice("Bearer ".length);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return jsonResponse({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id, course_title, score, grade, full_name } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return jsonResponse({ error: "Missing payment verification fields" }, 400);
    }

    const { data: payment, error: paymentLookupError } = await supabase
      .from("payments")
      .select("id, user_id, amount, purpose, status, razorpay_payment_id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (paymentLookupError || !payment) {
      return jsonResponse({ error: "Pending payment record not found" }, 404);
    }
    if (payment.user_id !== user.id) return jsonResponse({ error: "Forbidden" }, 403);

    if (payment.status === "success") {
      if (payment.razorpay_payment_id !== razorpay_payment_id) {
        return jsonResponse({ error: "Order was already paid with another payment" }, 409);
      }
      return jsonResponse({ success: true, message: "Payment already verified" });
    }
    if (payment.status !== "pending") {
      return jsonResponse({ error: "Payment is not pending" }, 409);
    }

    const expectedSignature = await createSignature(
      razorpayKeySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`,
    );
    if (!constantTimeEqual(expectedSignature, razorpay_signature)) {
      return jsonResponse({ error: "Invalid payment signature" }, 400);
    }

    if (payment.purpose === "pro_subscription") {
      if (payment.amount !== 49900) {
        return jsonResponse({ error: "Invalid subscription payment amount" }, 400);
      }

      const { error: userError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          plan_type: "pro",
        },
      });

      if (userError) {
        console.error("[verify-razorpay-payment] User update error", userError);
        return jsonResponse({ error: "Failed to activate Pro plan" }, 500);
      }
    }

    if (payment.purpose === "certificate") {
      if (payment.amount !== 9900) {
        return jsonResponse({ error: "Invalid certificate payment amount" }, 400);
      }
      
      if (!course_id || !course_title || score === undefined || !grade || !full_name) {
        return jsonResponse({ error: "Missing certificate details" }, 400);
      }

      // Verify user actually passed the exam for this course
      const { data: examAttempt, error: examError } = await supabase
        .from("final_exam_attempts")
        .select("passed, score")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (examError || !examAttempt) {
        console.error("[verify-razorpay-payment] Exam verification failed", examError);
        return jsonResponse({ error: "Exam record not found" }, 404);
      }

      if (!examAttempt.passed || examAttempt.score < 40) {
        return jsonResponse({ error: "User has not passed the final exam" }, 403);
      }

      // Validate score matches server truth
      if (examAttempt.score !== score) {
        return jsonResponse({ error: "Score mismatch with exam record" }, 400);
      }

      // Generate unique random certificate ID
      const randomPart = crypto.randomUUID().split('-')[0].toUpperCase();
      const certificateId = `LXAI-${new Date().getFullYear()}-${randomPart}`;

      // Insert certificate purchase record
      const { error: certError } = await supabase
        .from("certificate_purchases")
        .insert({
          user_id: user.id,
          course_id,
          course_title,
          certificate_id: certificateId,
          score,
          grade,
          full_name,
          purchase_amount: 9900,
          payment_id: razorpay_payment_id,
        });

      if (certError) {
        console.error("[verify-razorpay-payment] Certificate insert error", certError);
        return jsonResponse({ error: "Failed to create certificate record" }, 500);
      }
    }

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "success",
      })
      .eq("id", payment.id)
      .eq("status", "pending");

    if (paymentError) {
      console.error("[verify-razorpay-payment] Payment update error", paymentError);
      return jsonResponse({ error: "Failed to update payment record" }, 500);
    }

    const message = payment.purpose === "certificate" 
      ? "Payment verified and certificate created" 
      : "Payment verified and Pro activated";
    return jsonResponse({ success: true, message });
  } catch (error) {
    console.error("[verify-razorpay-payment] Unexpected error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
