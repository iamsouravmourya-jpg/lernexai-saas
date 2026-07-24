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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !razorpayKeyId || !razorpayKeySecret) {
      console.error("[create-razorpay-order] Missing required server secrets");
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

    const { amount, purpose } = await req.json();
    if (!Number.isInteger(amount) || amount <= 0 || !purpose) {
      return jsonResponse({ error: "Invalid amount or purpose" }, 400);
    }

    const expectedAmount = purpose === "pro_subscription" ? 49900 : amount;
    if (amount !== expectedAmount) {
      return jsonResponse({ error: "Invalid subscription amount" }, 400);
    }

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount: expectedAmount,
        currency: "INR",
        receipt: `lernex_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        notes: { user_id: user.id, purpose },
      }),
    });

    const order = await orderResponse.json();
    if (!orderResponse.ok || !order?.id) {
      console.error("[create-razorpay-order] Razorpay error", order);
      return jsonResponse({ error: order?.error?.description || "Failed to create Razorpay order" }, 502);
    }

    console.log("[create-razorpay-order] Fresh order created", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      userId: user.id,
    });

    const { error: dbError } = await supabase.from("payments").insert({
      user_id: user.id,
      amount: expectedAmount,
      razorpay_order_id: order.id,
      purpose,
      status: "pending",
    });

    if (dbError) {
      console.error("[create-razorpay-order] Database error", dbError);
      return jsonResponse({ error: "Failed to save payment record" }, 500);
    }

    return jsonResponse(order);
  } catch (error) {
    console.error("[create-razorpay-order] Unexpected error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
