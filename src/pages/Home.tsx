import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Subjects } from "@/components/landing/Subjects";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Certificate } from "@/components/landing/Certificate";
import { FAQ } from "@/components/landing/FAQ";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-foreground overflow-x-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global subtle texture */}
      <div className="fixed inset-0 z-0 bg-noise opacity-[0.02] mix-blend-multiply pointer-events-none"></div>
      
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-[120px] pointer-events-none z-0"></div>

      <Navbar />
      
      <main className="relative z-10 flex flex-col items-center">
        <Hero />
        <Problem />
        <Subjects />
        <Features />
        <HowItWorks />
        <Certificate />
        <FAQ />
        <Cta />
      </main>

      <Footer />
    </div>
  );
}
