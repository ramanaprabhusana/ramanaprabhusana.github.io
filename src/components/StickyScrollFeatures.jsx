import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { asset } from "../lib/asset";

export default function StickyScrollFeatures({ title, items = [] }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const count = Math.max(items.length, 1);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      const idx = Math.min(count - 1, Math.max(0, Math.floor(p * count)));
      setActive(idx);
    });
    return () => unsub?.();
  }, [scrollYProgress, count]);

  const current = useMemo(() => items[active] || {}, [items, active]);

  return (
    <section ref={ref} className="relative">
      <div className="py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="lg:sticky lg:top-20 h-[420px] sm:h-[520px] lg:h-[70vh] rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.image}
              className="h-full w-full"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.35 }}
            >
              <img
                src={current.image ? asset(current.image) : asset("brand/placeholder.png")}
                alt={current.heading || "Feature"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <div className="text-lg font-semibold">{current.heading}</div>
                <div className="opacity-85 mt-1">{current.subheading}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pb-20">
          <div className="space-y-6">
            {items.map((it, idx) => {
              const isActive = idx === active;
              return (
                <motion.div
                  key={it.heading + idx}
                  className={`rounded-2xl border p-6 transition-colors ${
                    isActive
                      ? "border-white/20 bg-white/10"
                      : "border-white/10 bg-white/5"
                  }`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center text-sm font-semibold">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{it.heading}</div>
                      <div className="opacity-85 mt-2 leading-relaxed">
                        {it.body}
                      </div>
                      {it.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {it.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs rounded-full border border-white/15 bg-white/5 px-3 py-1"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="h-[60vh]" />
        </div>
      </div>
    </section>
  );
}
