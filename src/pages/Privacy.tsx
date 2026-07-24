import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Link } from "wouter";
import { useLang } from "@/context/useLang";

export default function Privacy() {
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
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">{t("privacy.title")}</h1>
              <p className="text-slate-500 mt-1">{t("privacy.subtitle")}</p>
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
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("privacy.hero.title")}</h2>
                <p className="text-indigo-100 leading-relaxed">
                  {t("privacy.hero.desc")}
                </p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("privacy.collect.title")}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              {t("privacy.collect.desc")}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("privacy.collect.1")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("privacy.collect.2")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("privacy.collect.3")}</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{t("privacy.collect.4")}</span>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("privacy.use.title")}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("privacy.use.1.title")}</p>
                  <p className="text-slate-600 text-sm">{t("privacy.use.1.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("privacy.use.2.title")}</p>
                  <p className="text-slate-600 text-sm">{t("privacy.use.2.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("privacy.use.3.title")}</p>
                  <p className="text-slate-600 text-sm">{t("privacy.use.3.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <p className="font-semibold text-slate-900">{t("privacy.use.4.title")}</p>
                  <p className="text-slate-600 text-sm">{t("privacy.use.4.desc")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t("privacy.security.title")}</h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700 leading-relaxed">
                  {t("privacy.security.desc")}
                </p>
              </div>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{t("privacy.security.1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{t("privacy.security.2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{t("privacy.security.3")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{t("privacy.security.4")}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4">{t("privacy.contact.title")}</h2>
            <p className="text-indigo-100 mb-6">{t("privacy.contact.desc")}</p>
            <a 
              href="mailto:iamsouravmaurya@gmail.com" 
              className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              <Shield className="w-5 h-5 shrink-0" />
              <span className="break-all">iamsouravmaurya@gmail.com</span>
            </a>
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
