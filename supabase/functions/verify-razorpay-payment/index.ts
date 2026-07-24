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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
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

    return jsonResponse({ success: true, message: "Payment verified and Pro activated" });
  } catch (error) {
    console.error("[verify-razorpay-payment] Unexpected error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
