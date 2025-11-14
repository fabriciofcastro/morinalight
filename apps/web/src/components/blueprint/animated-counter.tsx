"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function AnimatedCounter({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${value.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) {
      return;
    }

    const formatValue = (val: number) => `${prefix}${val.toFixed(decimals)}${suffix}`;
    let raf = 0;
    const start = performance.now();
    const from = Number(node.dataset.startValue ?? "0");
    const to = value;
    const diff = to - from;

    const step = (now: number) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(elapsed);
      const current = from + diff * eased;
      node.textContent = formatValue(current);

      if (elapsed < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [decimals, duration, prefersReducedMotion, prefix, suffix, value]);

  return (
    <span
      ref={ref}
      className={className}
      data-final-value={final}
      data-start-value="0"
      aria-label={final}
    >
      {final}
    </span>
  );
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}
