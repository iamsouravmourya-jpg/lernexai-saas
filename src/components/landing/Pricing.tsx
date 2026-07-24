import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useLang } from "@/context/useLang";

export function Pricing() {
  const { t } = useLang();

  const freeFeatures = ["price.free.f1","price.free.f2","price.free.f3","price.free.f4"];
  const proFeatures  = ["price.pro.f1","price.pro.f2","price.pro.f3","price.pro.f4","price.pro.f5","price.pro.f6"];

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-indigo-50/60 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3"
          >
            {t("price.eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
          >
            {t("price.heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-500 max-w-xl mx-auto"
          >
            {t("price.sub")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col"
          >
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">{t("price.free.label")}</div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-slate-900">₹0</span>
                <span className="text-slate-400 mb-2">/{t("price.month")}</span>
              </div>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">{t("price.free.desc")}</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {freeFeatures.map((k) => (
                <li key={k} className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  {t(k)}
                </li>
              ))}
            </ul>

            <Button variant="outline" className="w-full rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              {t("price.free.cta")}
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 shadow-2xl shadow-indigo-500/25 text-white flex flex-col relative overflow-hidden"
          >
            {/* Popular badge */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white">
              <Zap className="w-3 h-3" />
              {t("price.popular")}
            </div>

            <div className="mb-6">
              <div className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-2">{t("price.pro.label")}</div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-white">₹499</span>
                <span className="text-indigo-200 mb-2">/{t("price.month")}</span>
              </div>
              <p className="mt-3 text-indigo-100 text-sm leading-relaxed">{t("price.pro.desc")}</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {proFeatures.map((k) => (
                <li key={k} className="flex items-start gap-3 text-sm text-white">
                  <Check className="w-4 h-4 text-indigo-200 mt-0.5 shrink-0" />
                  {t(k)}
                </li>
              ))}
            </ul>

            <Button className="w-full rounded-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {t("price.pro.cta")}
            </Button>
          </motion.div>

        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-slate-400 mt-8"
        >
          {t("price.note")}
        </motion.p>
      </div>
    </section>
  );
}
