import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/useLang";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export function Cta() {
  const { t } = useLang();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <section className="w-full py-24 px-6 relative overflow-hidden">
      {/* The background card */}
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/30">
        
        {/* Glows and patterns */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IiIgcj0iMiIgZmlsbD0iY2NsaW50LXNlY29uZCIgc3Ryb2tlPSIjRkZGIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" style={{ opacity: 0.5 }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 max-w-3xl"
          >
            {t("cta.heading")}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-10 leading-relaxed"
          >
            {t("cta.sub")}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg font-bold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all" onClick={() => setLocation(user ? "/dashboard" : "/auth")}>
              {user ? "Go to Dashboard" : t("cta.btn")}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
