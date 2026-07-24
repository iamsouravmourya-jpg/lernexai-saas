import { motion } from "framer-motion";
import { Award, CheckCircle2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/useLang";

const grades = [
  { range: "91–100", grade: "O",  label: "Outstanding",   from: "#7c3aed", to: "#9333ea", width: "100%" },
  { range: "86–90",  grade: "A+", label: "Exceptional",   from: "#4f46e5", to: "#6366f1", width: "89%" },
  { range: "80–85",  grade: "A",  label: "Excellent",     from: "#0284c7", to: "#0ea5e9", width: "82%" },
  { range: "70–79",  grade: "B",  label: "Good",          from: "#059669", to: "#10b981", width: "74%" },
  { range: "60–69",  grade: "C",  label: "Average",       from: "#d97706", to: "#f59e0b", width: "64%" },
  { range: "50–59",  grade: "D+", label: "Below Average", from: "#ea580c", to: "#f97316", width: "54%" },
  { range: "< 50",   grade: "D",  label: "Needs Work",    from: "#dc2626", to: "#ef4444", width: "35%" },
];

export function Certificate() {
  const { t } = useLang();

  return (
    <section className="w-full py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-50 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3"
          >
            {t("cert.eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4"
          >
            {t("cert.heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            {t("cert.sub")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ── LEFT: Steps + Price ── */}
          <div className="flex flex-col gap-6">
            {[
              { num: "01", titleKey: "cert.s1.title", descKey: "cert.s1.desc" },
              { num: "02", titleKey: "cert.s2.title", descKey: "cert.s2.desc" },
              { num: "03", titleKey: "cert.s3.title", descKey: "cert.s3.desc" },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                  {s.num}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{t(s.titleKey)}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t(s.descKey)}</p>
                </div>
              </motion.div>
            ))}

            {/* Price card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="mt-2 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-500/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                  <span className="text-sm text-indigo-100 font-medium">{t("cert.price.label")}</span>
                </div>
                <div className="text-4xl font-extrabold text-white">₹99</div>
                <div className="text-indigo-200 text-sm mt-1">{t("cert.price.note")}</div>
              </div>
              <Button className="w-full shrink-0 rounded-full bg-white px-6 font-bold text-indigo-600 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-indigo-50 sm:w-auto">
                {t("cert.price.cta")}
              </Button>
            </motion.div>
          </div>

          {/* ── RIGHT: Grade Visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-8 flex flex-col gap-6"
          >
            {/* Title row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base">{t("cert.grade.title")}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t("cert.grade.note")}</div>
              </div>
            </div>

            {/* Score spectrum bar */}
            <div className="relative h-3 rounded-full overflow-hidden"
              style={{ background: "linear-gradient(to right, #ef4444, #f97316, #f59e0b, #10b981, #0ea5e9, #6366f1, #9333ea)" }}
            >
              {/* Tick markers */}
              {[50, 60, 70, 80, 86, 91].map((v) => (
                <div
                  key={v}
                  className="absolute top-0 bottom-0 w-px bg-white/50"
                  style={{ left: `${v}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 -mt-4 px-0.5">
              <span>0</span><span>50</span><span>60</span><span>70</span><span>80</span><span>86</span><span>91</span><span>100</span>
            </div>

            {/* Grade cards */}
            <div className="flex flex-col gap-2">
              {grades.map((g, i) => (
                <motion.div
                  key={g.grade}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors group"
                >
                  {/* Grade badge */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg text-white shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  >
                    {g.grade}
                  </div>

                  {/* Label + range */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{g.label}</div>
                    <div className="text-xs text-slate-400 font-mono">{g.range}</div>
                  </div>

                  {/* Mini bar */}
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: g.width, background: `linear-gradient(to right, ${g.from}, ${g.to})` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom note */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <FlaskConical className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-slate-500">Retake your test anytime — free of charge.</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
