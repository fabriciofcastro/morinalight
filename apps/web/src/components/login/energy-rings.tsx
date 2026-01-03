"use client";

import { motion } from "framer-motion";

export function EnergyRings() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Anéis de energia concêntricos */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: `${200 + ring * 150}px`,
            height: `${200 + ring * 150}px`,
            borderColor: `hsl(var(--primary) / ${0.1 - ring * 0.02})`,
            borderWidth: "1px",
            boxShadow: `0 0 ${20 + ring * 10}px hsl(var(--primary) / ${0.2 - ring * 0.05})`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15 + ring * 5,
            repeat: Infinity,
            ease: "linear",
            delay: ring * 2,
          }}
        />
      ))}

      {/* Anéis diagonais */}
      {[1, 2].map((ring) => (
        <motion.div
          key={`diagonal-${ring}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: `${150 + ring * 100}px`,
            height: `${150 + ring * 100}px`,
            borderColor: `hsl(var(--secondary) / ${0.08 - ring * 0.02})`,
            borderWidth: "1px",
            boxShadow: `0 0 ${15 + ring * 8}px hsl(var(--secondary) / ${0.15 - ring * 0.05})`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 20 + ring * 8,
            repeat: Infinity,
            ease: "linear",
            delay: ring * 3,
          }}
        />
      ))}
    </div>
  );
}
