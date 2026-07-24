import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { createOrder, verifyPayment, openRazorpayCheckout } from "@/lib/razorpay";
import { Link } from "wouter";

const PRO_AMOUNT_PAISE = 49900;

export default function Upgrade() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.plan_type === "pro";

  const handleUpgrade = async () => {
    if (!user || !user.id) {
      setError("Please sign in before upgrading.");
      return;
    }

    setLoading(true);
    setError(null);
    console.info("[Upgrade] Starting payment flow", { userId: user.id, amount: PRO_AMOUNT_PAISE });

    try {
      const order = await createOrder({
        amount: PRO_AMOUNT_PAISE,
        purpose: "pro_subscription",
      });

      console.info("[Upgrade] Fresh order created", {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
      if (!order.id) throw new Error("We could not create a payment order. Please try again.");
      if (order.amount !== PRO_AMOUNT_PAISE || order.currency !== "INR") {
        throw new Error("Payment order amount or currency does not match the Pro plan.");
      }

      await openRazorpayCheckout({
        orderId: order.id,
        amount: order.amount,
        userName: user.name || "User",
        userEmail: user.email || "",
        onSuccess: async (response) => {
          console.info("[Upgrade] Razorpay success payload", response);
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.info("[Upgrade] Verification response", result);
            if (result?.success) {
              await refreshUser();
              setLoading(false);
            } else {
              setError(result?.error || "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (verifyErr: any) {
            setError(verifyErr?.message || "Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        onFailure: (error) => {
          const message = error?.description || error?.message || "Payment was cancelled or failed.";
          setError(`Payment failed: ${message}`);
          setLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong while starting the payment flow.");
      setLoading(false);
    }
  };

  const freeFeatures = [
    { text: "1 AI Custom Course per month", included: true },
    { text: "Limited premium content", included: true },
    { text: "Basic support", included: true },
    { text: "Community access", included: true },
    { text: "5 AI Custom Courses per month", included: false },
    { text: "Unlimited premium content", included: false },
    { text: "Priority support", included: false },
    { text: "Advanced analytics", included: false },
  ];

  const proFeatures = [
    { text: "5 AI Custom Courses per month", included: true },
    { text: "Unlimited premium content", included: true },
    { text: "Priority support", included: true },
    { text: "Community access", included: true },
    { text: "Advanced analytics", included: true },
    { text: "Early access to new features", included: true },
    { text: "Offline downloads", included: true },
    { text: "Certificate discounts", included: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upgrade Your Learning
          </h1>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your goals
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-8 relative"
          >
            {isPro ? null : (
              <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                Current Plan
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">₹0</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  {feature.included ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-gray-300">✗</span>
                  )}
                  <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            <button
              disabled={!isPro}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                !isPro
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {!isPro ? "Current Plan" : "Downgrade"}
            </button>
          </motion.div>

          {/* PRO Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border-2 border-purple-500 p-8 relative shadow-xl shadow-purple-100"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </span>
            {isPro ? (
              <span className="absolute top-4 right-4 bg-green-100 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
                Active
              </span>
            ) : null}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-sm text-gray-400 line-through mr-2">₹799</span>
              <span className="text-4xl font-bold text-gray-900">₹499</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-purple-500 font-bold">✓</span>
                  <span className="text-gray-700">{feature.text}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full py-3 rounded-xl bg-green-50 text-green-600 font-medium text-center">
                ✓ You are a Pro Member
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Upgrade to Pro →"}
              </button>
            )}
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-gray-500">
          <span>🔒 Secure Payment</span>
          <span>💳 UPI / Cards / Net Banking</span>
          <span>↩️ Cancel Anytime</span>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes! Cancel anytime from your settings. No questions asked." },
              { q: "How is payment processed?", a: "Payments are securely processed by Razorpay. We never store your card details." },
              { q: "Will I get a refund?", a: "Refunds are available within 7 days of payment if you are not satisfied." },
              { q: "What payment methods are supported?", a: "UPI, Credit/Debit Cards, Net Banking, and Wallets are all supported." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
