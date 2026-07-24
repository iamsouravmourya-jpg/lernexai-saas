import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/context/useLang";

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.8"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            Lernex<span className="text-slate-500">AI</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">{t("footer.privacy")}</Link>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <Link href="/terms" className="hover:text-indigo-600 transition-colors">{t("footer.terms")}</Link>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <Link href="/contact" className="hover:text-indigo-600 transition-colors">{t("footer.contact")}</Link>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <Link href="/about-founder" className="hover:text-indigo-600 transition-colors">{t("footer.aboutFounder")}</Link>
        </div>

        {/* Copyright */}
        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} LernexAI. {t("footer.copy")}
        </div>
      </div>
    </footer>
  );
}
