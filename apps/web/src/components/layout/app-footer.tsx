"use client";

import Link from "next/link";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,hsl(var(--surface))_72%,transparent_28%)] backdrop-blur-xl px-6 py-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 holo-grid" />
        <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
        <div className="absolute right-[10%] top-0 h-full w-px beam-line opacity-25" />
      </div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-4">
          <span>&copy; {currentYear} Morina Têxtil</span>
          <span className="h-3 w-px bg-white/20" />
          <span>v2.0.0</span>
        </div>
        <div className="flex items-center justify-center gap-4 flex-1">
          <Link href="/termos" className="hover:text-white/70 transition-colors">
            Termos
          </Link>
          <Link href="/privacidade" className="hover:text-white/70 transition-colors">
            Privacidade
          </Link>
          <Link href="/lgpd" className="hover:text-white/70 transition-colors">
            LGPD
          </Link>
        </div>
        <div className="w-[120px]" /> {/* Spacer para manter alinhamento */}
      </div>
    </footer>
  );
}
