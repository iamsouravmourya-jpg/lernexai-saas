import { motion } from "framer-motion";
import { User, Mail, Code, Heart, Target, Zap, GraduationCap, ExternalLink, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Link } from "wouter";

export default function AboutFounder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <Navbar />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-20 z-40 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-2">← Back to Home</Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-300/50">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">About the Founder</h1>
              <p className="text-slate-500 mt-1">The person behind LernexAI</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Hero Card */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <User className="w-20 h-20 text-white/80" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Sourav Maurya</h2>
                <p className="text-indigo-100 text-lg mb-4">Founder & CEO, LernexAI</p>
                <p className="text-indigo-100 leading-relaxed">
                  19-year-old coder and AI enthusiast building tools that solve real problems. Currently pursuing BCA at IGNOU.
                </p>
              </div>
            </div>
          </section>

          {/* The Story */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Why I Built LernexAI</h2>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <p className="text-slate-700 leading-relaxed mb-4">
                Everywhere I went, I saw the same problem — people struggling to learn new things. Ask AI, search Google, watch videos... it's exhausting just to learn one simple concept. The headache of finding the right resource, the confusion of conflicting information, the frustration of getting stuck.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                So I built my own tool. LernexAI is my solution to this chaos — a personalized AI tutor that adapts to you, not the other way around. No more endless searching, no more one-size-fits-all courses. Just focused, efficient learning.
              </p>
              <p className="text-slate-700 leading-relaxed">
                That's easy — right? But making it actually work for real students, with real problems, that's the challenge I love.
              </p>
            </div>
          </section>

          {/* More About Me */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">More About Me</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Self-Taught Developer</p>
                  <p className="text-slate-600 text-sm">Started coding at 16, learned everything from online resources. Built my first project before joining college.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Problem Solver at Heart</p>
                  <p className="text-slate-600 text-sm">I don't just code — I solve real problems. Every product I build addresses a genuine pain point I've experienced or observed.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Big Dreams, Small Steps</p>
                  <p className="text-slate-600 text-sm">I want to build products that impact millions. Starting with LernexAI and PyEater, but this is just the beginning.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Balancing Act</p>
                  <p className="text-slate-600 text-sm">Managing BCA studies at IGNOU while running two startups. It's challenging but I love every bit of it.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Vision */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">My Vision</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700 leading-relaxed">
                  I want my products to help people. That's it. Whether it's LernexAI making education accessible, or my other projects solving different problems — my goal is simple: build things that make life easier for others.
                </p>
              </div>
            </div>
          </section>

          {/* Skills & Background */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Background & Skills</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Coder & Prototyping Expert</p>
                  <p className="text-slate-600 text-sm">Master at rapid prototyping and turning ideas into functional products quickly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">BCA Student</p>
                  <p className="text-slate-600 text-sm">Currently pursuing Bachelor of Computer Applications at IGNOU (1st Year).</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Founder of PyEater</p>
                  <p className="text-slate-600 text-sm">Also built <a href="https://www.pyeater.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">PyEater.in <ExternalLink className="w-3 h-3" /></a> — an AI-powered spreadsheet auditing tool that scans spreadsheets to find and fix wrong formulas that cause financial damage.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Quick Facts</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 mb-1">19</p>
                <p className="text-slate-600 text-sm">Years Old</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                <p className="text-3xl font-bold text-purple-600 mb-1">2+</p>
                <p className="text-slate-600 text-sm">Products Built</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 mb-1">∞</p>
                <p className="text-slate-600 text-sm">Ideas to Explore</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Let's Connect</h2>
            <p className="text-indigo-100 mb-6">Want to collaborate, have feedback, or just want to say hi? Feel free to reach out!</p>
            <a 
              href="mailto:iamsouravmaurya@gmail.com" 
              className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600 shadow-lg transition-colors hover:bg-indigo-50 sm:px-8 sm:py-4 sm:text-lg"
            >
              <Mail className="h-5 w-5 shrink-0" />
              <span className="break-all">iamsouravmaurya@gmail.com</span>
            </a>
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
