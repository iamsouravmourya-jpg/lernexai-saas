import { supabase } from "./supabase";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface CreateOrderParams {
  amount: number;
  purpose: "pro_subscription" | "certificate";
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface RazorpayFailure {
  description?: string;
  message?: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: RazorpayFailure }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

function getFunctionError(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

async function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return;

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Razorpay checkout.")), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export async function createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
  const { data, error } = await supabase.functions.invoke<RazorpayOrder>("create-razorpay-order", {
    body: params,
  });

  if (error) throw new Error(getFunctionError(error, "Failed to create payment order."));
  if (!data?.id) throw new Error("Payment service returned an invalid order.");
  if (!Number.isInteger(data.amount) || data.amount <= 0 || data.currency !== "INR") {
    throw new Error("Payment service returned an invalid amount or currency.");
  }

  return data;
}

export async function verifyPayment(params: RazorpayPaymentResponse & {
  course_id?: string;
  course_title?: string;
  score?: number;
  grade?: string;
  full_name?: string;
}): Promise<VerifyPaymentResult> {
  const { data, error } = await supabase.functions.invoke<VerifyPaymentResult>("verify-razorpay-payment", {
    body: params,
  });

  if (error) throw new Error(getFunctionError(error, "Payment verification failed."));
  if (!data) throw new Error("Payment service returned an invalid response.");

  return data;
}

export async function openRazorpayCheckout(options: {
  orderId: string;
  amount: number;
  userName: string;
  userEmail: string;
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure: (error: RazorpayFailure) => void;
}): Promise<void> {
  if (!RAZORPAY_KEY_ID) {
    throw new Error("VITE_RAZORPAY_KEY_ID is not configured.");
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable.");
  }

  let failureHandled = false;
  const handleFailure = (error: RazorpayFailure) => {
    if (failureHandled) return;
    failureHandled = true;
    options.onFailure(error);
  };

  const checkout = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: "INR",
    name: "LernexAI",
    description: options.orderId.includes("cert") ? "LernexAI Certificate" : "LernexAI Pro subscription",
    order_id: options.orderId,
    image: "/favicon.svg",
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    theme: {
      color: "#7c3aed",
    },
    handler: options.onSuccess,
    modal: {
      ondismiss: () => handleFailure({ message: "Payment checkout was closed." }),
    },
  });

  checkout.on("payment.failed", response => {
    handleFailure(response.error || { message: "Payment failed." });
  });

  checkout.open();
}
