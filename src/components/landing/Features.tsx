import { motion, type Variants } from "framer-motion";
import { Compass, Languages, BrainCircuit, Award } from "lucide-react";
import { useLang } from "@/context/useLang";

export function Features() {
  const { t } = useLang();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section className="w-full py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4"
          >
            {t("features.heading")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl"
          >
            {t("features.sub")}
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Card 1: AI Course Architect (Wide) */}
          <motion.div variants={item} className="md:col-span-8 bg-indigo-50/50 rounded-[2rem] p-8 md:p-12 border border-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/20">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">{t("features.f1.title")}</h3>
                <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                  {t("features.f1.desc")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Bilingual Tutor (Square) */}
          <motion.div variants={item} className="md:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("features.f2.title")}</h3>
            <p className="text-slate-600 leading-relaxed">{t("features.f2.desc")}</p>
            
            {/* Visual fluff */}
            <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm">
              <div className="flex gap-3 items-start mb-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0" />
                <div className="bg-white border border-slate-200 rounded-lg rounded-tl-none p-2 text-slate-600 shadow-sm">Recursion kya hota hai?</div>
              </div>
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-purple-600 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">AI</div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg rounded-tr-none p-2 text-purple-900 shadow-sm text-right">Socho ek box ke andar box...</div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Micro-Quizzes (Square) */}
          <motion.div variants={item} className="md:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("features.f3.title")}</h3>
            <p className="text-slate-600 leading-relaxed">{t("features.f3.desc")}</p>
          </motion.div>

          {/* Card 4: Industry Recognized (Wide, Dark) */}
          <motion.div variants={item} className="md:col-span-8 bg-slate-900 rounded-[2rem] p-8 md:p-12 relative overflow-hidden text-white group">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between h-full">
              <div className="max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-yellow-400 flex items-center justify-center mb-8 backdrop-blur-md">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">{t("features.f4.title")}</h3>
                <p className="text-lg text-slate-300 leading-relaxed">{t("features.f4.desc")}</p>
              </div>
              
              <div className="w-full md:w-auto relative">
                <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full bg-slate-900 rounded-lg border border-white/10 p-4 flex flex-col justify-center items-center text-center">
                    <Award className="w-12 h-12 text-yellow-400 mb-2 opacity-80" />
                    <div className="text-sm font-bold text-white tracking-widest uppercase mb-1">Certificate</div>
                    <div className="text-xs text-slate-400">of Mastery</div>
                    <div className="mt-4 w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
