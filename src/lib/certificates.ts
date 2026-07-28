import { supabase } from "./supabase";

export interface CertificatePurchase {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  certificate_id: string;
  score: number;
  grade: string;
  full_name: string;
  issued_at: string;
  purchase_amount: number;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchUserCertificatePurchases(userId: string): Promise<CertificatePurchase[]> {
  const { data, error } = await supabase
    .from("certificate_purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch certificate purchases");
  return data || [];
}

export async function fetchCertificatePurchaseByCourse(userId: string, courseId: string | undefined): Promise<CertificatePurchase | null> {
  if (!courseId) return null;

  const { data, error } = await supabase
    .from("certificate_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") throw new Error("Failed to fetch certificate purchase");
  return data || null;
}

export async function createCertificatePurchase(params: {
  userId: string;
  courseId: string;
  courseTitle: string;
  score: number;
  grade: string;
  fullName: string;
  paymentId?: string;
}): Promise<CertificatePurchase> {
  const certificateId = `LXAI-${new Date().getFullYear()}-${params.courseId.slice(0, 4).toUpperCase()}-${params.score}`;

  const { data, error } = await supabase
    .from("certificate_purchases")
    .insert({
      user_id: params.userId,
      course_id: params.courseId,
      course_title: params.courseTitle,
      certificate_id: certificateId,
      score: params.score,
      grade: params.grade,
      full_name: params.fullName,
      purchase_amount: 9900,
      payment_id: params.paymentId || null,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create certificate purchase");
  return data;
}

export async function recordCertificateDownload(params: {
  certificateId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const { error } = await supabase
    .from("certificate_downloads")
    .insert({
      certificate_id: params.certificateId,
      user_id: params.userId,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });

  if (error) throw new Error("Failed to record certificate download");
}
