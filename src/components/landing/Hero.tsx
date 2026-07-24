import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useLang } from "@/context/useLang";

export function Hero() {
  const { t } = useLang();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Content */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start text-left max-w-2xl"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {t("hero.badge")}
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            {t("hero.h1a")} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-[length:200%_auto] animate-gradient">
              {t("hero.h1b")}
            </span>
          </motion.h1>
          
          <motion.p variants={item} className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
            {t("hero.sub")}
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base group">
              {t("hero.cta")}
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base gap-2 group bg-white/50 backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Play className="w-3 h-3 text-indigo-700 ml-0.5" fill="currentColor" />
              </div>
              {t("hero.demo")}
            </Button>
          </motion.div>
          
          <motion.div variants={item} className="mt-10 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="avatar" />
                </div>
              ))}
            </div>
            <p>{t("hero.social")}</p>
          </motion.div>
        </motion.div>

        {/* Right Image/Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:ml-auto w-full max-w-[600px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/50"
        >
          {/* Main Hero Image */}
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
          <img 
            src="/hero-image.jpg" 
            alt="Student learning with AI" 
            className="absolute inset-0 w-full h-full object-cover z-10"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop";
            }}
          />
          
          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 top-1/3 z-20 bg-white/90 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-xl max-w-[180px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                AI
              </div>
              <div className="text-xs font-semibold text-slate-800">LernexAI Tutor</div>
            </div>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">You're doing great! Let's review React hooks.</p>
          </motion.div>

          {/* Decorative Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-tr from-indigo-900/20 via-transparent to-purple-900/20 mix-blend-overlay" />
        </motion.div>
      </div>
    </section>
  );
}
