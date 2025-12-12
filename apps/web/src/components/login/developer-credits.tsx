"use client";

import { motion } from "framer-motion";
import { Activity, Code2, Cpu, Database, Palette } from "lucide-react";

const developers = [
  {
    name: "Michel",
    url: "https://github.com/michel", // Placeholder
    icon: Database,
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  {
    name: "Adriana",
    url: "https://dribbble.com/adriana", // Placeholder
    icon: Palette,
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
  },
  {
    name: "Fabrício",
    url: "https://github.com/fabricio", // Placeholder
    icon: Code2,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
];

export function DeveloperCredits() {
  return (
    <div className="relative p-3 xl:p-4 border border-white/10 bg-black/40 backdrop-blur-sm w-full max-w-xs xl:max-w-sm group overflow-hidden">
      {/* Tech Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

      {/* Scanline */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none" />

      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-3 w-3 text-[hsl(var(--primary))]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/60">
            IDEALIZADORES
          </span>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1 bg-[hsl(var(--primary))] animate-pulse" />
          <div className="h-1 w-1 bg-[hsl(var(--primary))] opacity-50" />
          <div className="h-1 w-1 bg-[hsl(var(--primary))] opacity-25" />
        </div>
      </div>

      <div className="space-y-2">
        {developers.map((dev, index) => (
          <motion.a
            key={dev.name}
            href={dev.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className={`flex items-center justify-between p-2 border ${dev.border} ${dev.bg} hover:bg-white/10 transition-all cursor-pointer group/item`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-none border border-white/10 bg-black/50 group-hover/item:scale-110 transition-transform`}
              >
                <dev.icon className={`h-3 w-3 ${dev.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white tracking-wider uppercase group-hover/item:text-[hsl(var(--primary))] transition-colors">
                  {dev.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <Activity className={`h-3 w-3 ${dev.color}`} />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
