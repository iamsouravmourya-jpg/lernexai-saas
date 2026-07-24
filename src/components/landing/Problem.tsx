import { motion } from "framer-motion";
import { RouteOff, Tv, Sparkles, TrendingUp, MessageCircle } from "lucide-react";
import { useLang } from "@/context/useLang";

export function Problem() {
  const { t } = useLang();

  return (
    <section className="w-full bg-slate-50 border-y border-slate-200/50 relative overflow-hidden py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4"
          >
            {t("problem.heading")}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
              <RouteOff className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("problem.card1.title")}</h3>
            <p className="text-slate-600 leading-relaxed">{t("problem.card1.desc")}</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
              <Tv className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("problem.card2.title")}</h3>
            <p className="text-slate-600 leading-relaxed">{t("problem.card2.desc")}</p>
          </motion.div>

          {/* Card 3 - The LernexAI Approach */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("problem.card3.title")}</h3>
              <p className="text-indigo-100 leading-relaxed mb-6">{t("problem.card3.desc")}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <TrendingUp className="w-5 h-5 text-indigo-200" />
                  <span className="font-medium text-sm">{t("problem.badge1")}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <MessageCircle className="w-5 h-5 text-indigo-200" />
                  <span className="font-medium text-sm">{t("problem.badge2")}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
