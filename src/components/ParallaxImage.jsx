import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export default function ParallaxImage({
  src,
  alt,
  className = "",
  strength = 40,
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1.02, 0.98]);

  return (
    <motion.div ref={ref} style={{ y, scale }} className={className}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover rounded-2xl"
        loading="lazy"
      />
    </motion.div>
  );
}
