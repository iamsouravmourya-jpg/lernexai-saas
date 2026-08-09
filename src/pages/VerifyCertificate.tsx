import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Award, CheckCircle2, Loader2, Search, ShieldAlert, XCircle } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { verifyCertificatePublic, type CertificateVerification } from "@/lib/certificates";

function formatIssuedDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function VerifyCertificate() {
  const params = useParams<{ certificateId?: string }>();
  const initialId = params.certificateId ? decodeURIComponent(params.certificateId) : "";

  const [certificateId, setCertificateId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runVerify = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError("Enter a certificate ID to verify.");
      setResult(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const verification = await verifyCertificatePublic(trimmed);
      setResult(verification);
    } catch (verifyError) {
      setResult(null);
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId.trim()) {
      void runVerify(initialId);
    }
  }, [initialId, runVerify]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void runVerify(certificateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 pb-16 pt-28">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-300/40">
            <Award className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">Verify certificate</h1>
          <p className="mt-3 text-slate-600">
            Scan the QR on a LernexAI certificate or enter the certificate ID below to confirm it is genuine.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <label htmlFor="certificate-id" className="block text-sm font-semibold text-slate-700">
            Certificate ID
          </label>
          <p className="mt-1 text-xs text-slate-500">Example: LXAI-2026-ABCD-85</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="certificate-id"
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              placeholder="LXAI-2026-..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              Check
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {hasSearched && !loading && !error && result?.valid && (
          <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700">Verified candidate</p>
                <h2 className="text-2xl font-bold text-green-900">{result.full_name}</h2>
              </div>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-green-200/80 pb-3">
                <dt className="text-green-800/80">Course</dt>
                <dd className="font-semibold text-green-900 text-right">{result.course_title}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-green-200/80 pb-3">
                <dt className="text-green-800/80">Grade</dt>
                <dd className="font-semibold text-green-900">{result.grade}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-green-200/80 pb-3">
                <dt className="text-green-800/80">Score</dt>
                <dd className="font-semibold text-green-900">{result.score}%</dd>
              </div>
              {result.issued_at && (
                <div className="flex justify-between gap-4 border-b border-green-200/80 pb-3">
                  <dt className="text-green-800/80">Issued</dt>
                  <dd className="font-semibold text-green-900">{formatIssuedDate(result.issued_at)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 pt-1">
                <dt className="text-green-800/80">Certificate ID</dt>
                <dd className="font-mono text-xs font-semibold text-green-900 text-right sm:text-sm">{result.certificate_id}</dd>
              </div>
            </dl>
          </div>
        )}

        {hasSearched && !loading && !error && result && !result.valid && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <XCircle className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Not verified</h2>
            <p className="mt-2 text-sm text-slate-600">
              We could not find this certificate in our records. Check the ID and try again, or contact{" "}
              <Link href="/contact" className="font-semibold text-purple-600 hover:underline">
                support
              </Link>
              .
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
