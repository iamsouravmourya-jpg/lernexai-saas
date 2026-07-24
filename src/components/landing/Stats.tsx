import { motion } from "framer-motion";
import { useLang } from "@/context/useLang";

export function Stats() {
  const { t } = useLang();

  const stats = [
    { valueKey: "stats.v1", labelKey: "stats.l1" },
    { valueKey: "stats.v2", labelKey: "stats.l2" },
    { valueKey: "stats.v3", labelKey: "stats.l3" },
    { valueKey: "stats.v4", labelKey: "stats.l4" },
  ];

  return (
    <section className="w-full py-12 border-y border-slate-100 bg-white/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 tracking-tight">
                {t(s.valueKey)}
              </span>
              <span className="mt-2 text-sm md:text-base text-slate-500 font-medium">{t(s.labelKey)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
