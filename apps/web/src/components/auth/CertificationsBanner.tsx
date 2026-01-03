'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';

export function CertificationsBanner() {
  return (
    <Link
      href="/certifications"
      className="group relative block border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] backdrop-blur-[2px] py-3 px-4 hover:border-[hsl(var(--primary)/0.6)] transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Animated Border Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[hsl(var(--primary))] animate-pulse" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[hsl(var(--primary))] animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[hsl(var(--primary))] animate-pulse" style={{ animationDelay: '0.4s' }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[hsl(var(--primary))] animate-pulse" style={{ animationDelay: '0.6s' }} />

      {/* Reflection Effect - SEMPRE PERCORRENDO */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shine_3s_ease-in-out_infinite] pointer-events-none"
        style={{ width: '50%' }} />

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-[hsl(var(--primary)/0.15)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Scanline Effect - só no hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3">
        {/* Left: Icon + Text */}
        <div className="flex items-center gap-3">
          {/* Animated Shield Icon */}
          <div className="relative p-2 border-2 border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary)/0.2)] transition-all duration-300 group-hover:scale-110">
            <Shield className="h-6 w-6 text-[hsl(var(--primary))] group-hover:animate-pulse" />
            {/* Glow behind icon */}
            <div className="absolute inset-0 bg-[hsl(var(--primary))] blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          </div>

          {/* Text - UMA LINHA SÓ */}
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-[hsl(var(--primary))] group-hover:text-white transition-colors duration-300 whitespace-nowrap">
            Certificações de Segurança
          </div>
        </div>

        {/* Right: Arrow - SEM TEXTO */}
        <div className="text-[hsl(var(--primary))] group-hover:translate-x-2 transition-transform duration-300">
          <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* CSS for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(300%) skewX(-15deg);
          }
        }
      `}</style>
    </Link>
  );
}
