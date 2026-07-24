import { motion } from "framer-motion";
import { useLang } from "@/context/useLang";
import { Star } from "lucide-react";

const testimonials = [
  {
    seed: "arjun",
    nameKey: "test.n1", roleKey: "test.r1", quoteKey: "test.q1",
    bg: "from-indigo-50 to-white", stars: 5,
  },
  {
    seed: "priya",
    nameKey: "test.n2", roleKey: "test.r2", quoteKey: "test.q2",
    bg: "from-purple-50 to-white", stars: 5,
  },
  {
    seed: "rahul",
    nameKey: "test.n3", roleKey: "test.r3", quoteKey: "test.q3",
    bg: "from-sky-50 to-white", stars: 5,
  },
  {
    seed: "sneha",
    nameKey: "test.n4", roleKey: "test.r4", quoteKey: "test.q4",
    bg: "from-emerald-50 to-white", stars: 5,
  },
  {
    seed: "karan",
    nameKey: "test.n5", roleKey: "test.r5", quoteKey: "test.q5",
    bg: "from-rose-50 to-white", stars: 5,
  },
  {
    seed: "meera",
    nameKey: "test.n6", roleKey: "test.r6", quoteKey: "test.q6",
    bg: "from-amber-50 to-white", stars: 5,
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { t } = useLang();

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-50/60 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3"
          >
            {t("test.eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
          >
            {t("test.heading")}
          </motion.h2>
        </div>

        {/* Featured quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-10 md:p-14 text-white text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl text-white/20 font-serif mb-4 leading-none">"</div>
            <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed max-w-3xl mx-auto mb-6">
              {t("test.featured")}
            </p>
            <div className="flex items-center justify-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=vikram&backgroundColor=818cf8"
                alt="Vikram"
                className="w-10 h-10 rounded-full border-2 border-white/30"
              />
              <div className="text-left">
                <div className="font-bold text-white text-sm">{t("test.featured.name")}</div>
                <div className="text-indigo-200 text-xs">{t("test.featured.role")}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`bg-gradient-to-br ${test.bg} rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow`}
            >
              <StarRow count={test.stars} />
              <p className="mt-4 text-slate-700 leading-relaxed text-sm mb-5">"{t(test.quoteKey)}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${test.seed}&backgroundColor=e2e8f0`}
                  alt={t(test.nameKey)}
                  className="w-9 h-9 rounded-full border border-slate-200"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t(test.nameKey)}</div>
                  <div className="text-xs text-slate-500">{t(test.roleKey)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
