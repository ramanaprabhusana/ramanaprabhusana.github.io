import React from "react";
import { motion } from "motion/react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 16,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}
