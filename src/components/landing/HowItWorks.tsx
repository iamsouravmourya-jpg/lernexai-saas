import { motion } from "framer-motion";
import { useLang } from "@/context/useLang";

export function HowItWorks() {
  const { t } = useLang();

  const steps = [
    { num: "01", titleKey: "how.s1.title", descKey: "how.s1.desc" },
    { num: "02", titleKey: "how.s2.title", descKey: "how.s2.desc" },
    { num: "03", titleKey: "how.s3.title", descKey: "how.s3.desc" },
  ];

  return (
    <section className="w-full py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
          >
            {t("how.heading")}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Steps */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-indigo-100 hidden md:block" />
            
            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative flex gap-6 md:gap-8 items-start group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-indigo-100 shadow-sm flex items-center justify-center shrink-0 text-indigo-600 font-bold text-xl relative z-10 group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-colors">
                    {step.num}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{t(step.titleKey)}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">{t(step.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Abstract Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-500/10 border border-slate-100"
          >
            <div className="absolute inset-0 bg-slate-100 animate-pulse" />
            <img 
              src="/abstract-learning.jpg" 
              alt="Futuristic learning path" 
              className="absolute inset-0 w-full h-full object-cover z-10"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop";
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-900/40 to-transparent mix-blend-overlay" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
