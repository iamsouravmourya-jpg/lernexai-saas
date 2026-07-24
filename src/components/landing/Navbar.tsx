import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLang } from "@/context/useLang";

export function Navbar() {
  const { lang, setLang, t } = useLang();
  const [, setLocation] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-4 px-4"
    >
      <div className="relative w-full max-w-6xl mx-auto">
      <div className="h-16 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 sm:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-300/50 group-hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.8"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Lernex<span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle */}
          <div className="hidden items-center gap-1 rounded-full border border-slate-200/60 bg-slate-100/70 px-1.5 py-1 text-sm font-medium sm:flex">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                lang === "en"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                lang === "hi"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              HI
            </button>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" className="rounded-full" onClick={() => setLocation("/auth")}>{t("nav.login")}</Button>
            <Button variant="gradient" className="rounded-full shadow-indigo-200" onClick={() => setLocation("/auth")}>{t("nav.start")}</Button>
          </div>

          <Button variant="gradient" size="sm" className="rounded-full shadow-indigo-200 sm:hidden" onClick={() => setLocation("/auth")}>{t("nav.start")}</Button>

          <button
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 sm:hidden"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-3xl border border-white/40 bg-white/95 p-4 shadow-xl backdrop-blur-xl sm:hidden">
          <div className="flex items-center justify-center gap-1 rounded-full border border-slate-200/60 bg-slate-100/70 p-1 text-sm font-medium">
            <Globe className="ml-1.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <button onClick={() => setLang("en")} className={`flex-1 rounded-full px-2.5 py-1.5 transition-all ${lang === "en" ? "bg-white text-slate-900 shadow-sm border border-slate-200/80" : "text-slate-400 hover:text-slate-600"}`}>EN</button>
            <button onClick={() => setLang("hi")} className={`flex-1 rounded-full px-2.5 py-1.5 transition-all ${lang === "hi" ? "bg-white text-slate-900 shadow-sm border border-slate-200/80" : "text-slate-400 hover:text-slate-600"}`}>HI</button>
          </div>
          <Button variant="ghost" className="mt-3 w-full rounded-full border border-slate-200" onClick={() => { setMobileNavOpen(false); setLocation("/auth"); }}>{t("nav.login")}</Button>
        </div>
      )}
      </div>
    </motion.header>
  );
}
