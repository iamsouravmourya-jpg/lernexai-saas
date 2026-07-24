import { motion } from "framer-motion";
import { useLang } from "@/context/useLang";
import { Code2, TrendingUp, Palette, Database, Cpu, BookOpen, BarChart3, Shield } from "lucide-react";

const subjects = [
  { icon: Code2,     color: "bg-blue-50 text-blue-600",    titleKey: "subj.web",      descKey: "subj.web.d" },
  { icon: TrendingUp,color: "bg-emerald-50 text-emerald-600",titleKey:"subj.stock",   descKey: "subj.stock.d" },
  { icon: Palette,   color: "bg-pink-50 text-pink-600",    titleKey: "subj.design",   descKey: "subj.design.d" },
  { icon: Database,  color: "bg-orange-50 text-orange-600",titleKey: "subj.data",     descKey: "subj.data.d" },
  { icon: Cpu,       color: "bg-violet-50 text-violet-600",titleKey: "subj.ai",       descKey: "subj.ai.d" },
  { icon: BookOpen,  color: "bg-yellow-50 text-yellow-600",titleKey: "subj.exam",     descKey: "subj.exam.d" },
  { icon: BarChart3, color: "bg-teal-50 text-teal-600",    titleKey: "subj.finance",  descKey: "subj.finance.d" },
  { icon: Shield,    color: "bg-rose-50 text-rose-600",    titleKey: "subj.cyber",    descKey: "subj.cyber.d" },
];

export function Subjects() {
  const { t } = useLang();

  return (
    <section className="w-full py-24 bg-slate-50/60 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-purple-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3"
          >
            {t("subj.eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
          >
            {t("subj.heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-500 max-w-xl mx-auto"
          >
            {t("subj.sub")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-base group-hover:text-indigo-600 transition-colors">
                  {t(s.titleKey)}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t(s.descKey)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
