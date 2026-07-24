import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, Scale, Gavel, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Link } from "wouter";
import { useLang } from "@/context/useLang";

export default function Terms() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <Navbar />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-20 z-40 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-2">← Back to Home</Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-300/50">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">{t("terms.title")}</h1>
              <p className="text-slate-500 mt-1">{t("terms.subtitle")}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Hero Summary */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("terms.hero.title")}</h2>
                <p className="text-indigo-100 leading-relaxed">
                  {t("terms.hero.desc")}
                </p>
              </div>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("terms.accept.title")}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t("terms.accept.desc")}
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("terms.responsibilities.title")}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("terms.responsibilities.1")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("terms.responsibilities.2")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("terms.responsibilities.3")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("terms.responsibilities.4")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("terms.responsibilities.5")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("terms.responsibilities.6")}</span>
              </div>
            </div>
          </section>

          {/* Subscription & Payment */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("terms.payment.title")}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("terms.payment.1.title")}</p>
                  <p className="text-slate-600 text-sm">{t("terms.payment.1.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("terms.payment.2.title")}</p>
                  <p className="text-slate-600 text-sm">{t("terms.payment.2.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("terms.payment.3.title")}</p>
                  <p className="text-slate-600 text-sm">{t("terms.payment.3.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("terms.payment.4.title")}</p>
                  <p className="text-slate-600 text-sm">{t("terms.payment.4.desc")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("terms.ip.title")}</h2>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
              <p className="text-slate-700 leading-relaxed mb-4">
                {t("terms.ip.desc")}
              </p>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <p className="text-slate-600 text-sm">{t("terms.ip.note")}</p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("terms.liability.title")}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t("terms.liability.desc")}
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4">{t("terms.contact.title")}</h2>
            <p className="text-indigo-100 mb-6">{t("terms.contact.desc")}</p>
            <a 
              href="mailto:iamsouravmaurya@gmail.com" 
              className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span className="break-all">iamsouravmaurya@gmail.com</span>
            </a>
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
