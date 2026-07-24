import { motion } from "framer-motion";
import { Mail, Send, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Link } from "wouter";
import { useLang } from "@/context/useLang";

export default function Contact() {
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
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">{t("contact.title")}</h1>
              <p className="text-slate-500 mt-1">{t("contact.subtitle")}</p>
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
          {/* Hero Card */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 flex-shrink-0">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-3">{t("contact.hero.title")}</h2>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  {t("contact.hero.desc")}
                </p>
              </div>
            </div>
          </section>

          {/* Email Contact */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email Us</h2>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <p className="text-slate-600 mb-6 text-center text-lg">
                For any inquiries, support, or feedback, please reach out to us via email:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="mailto:iamsouravmaurya@gmail.com" 
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-300/50 transition-all hover:from-indigo-700 hover:to-purple-700 sm:px-8 sm:py-4 sm:text-lg"
                >
                  <Mail className="h-6 w-6 shrink-0" />
                  <span className="break-all">iamsouravmaurya@gmail.com</span>
                </a>
              </div>
            </div>
          </section>

          {/* Response Time */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Response Time</h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-700 leading-relaxed mb-3">
                    We typically respond to all emails within <strong className="text-green-700">24-48 hours</strong>.
                  </p>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">For urgent matters, please include "URGENT" in your subject line.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What We Can Help With */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">What We Can Help With</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">General Inquiries</p>
                  <p className="text-slate-600 text-sm">Questions about LernexAI services</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Technical Support</p>
                  <p className="text-slate-600 text-sm">Troubleshooting and assistance</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Billing Questions</p>
                  <p className="text-slate-600 text-sm">Subscriptions and payments</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Partnerships</p>
                  <p className="text-slate-600 text-sm">Collaboration opportunities</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Feedback</p>
                  <p className="text-slate-600 text-sm">Suggestions and improvements</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Press & Media</p>
                  <p className="text-slate-600 text-sm">Interviews and features</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Contact CTA */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-indigo-100 mb-6">Drop us a line and we'll get back to you as soon as possible.</p>
            <a 
              href="mailto:iamsouravmaurya@gmail.com" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-lg shadow-lg"
            >
              <Mail className="w-5 h-5" />
              <span>Send Email Now</span>
            </a>
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
