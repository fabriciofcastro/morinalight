"use client";

import Link from "next/link";
import { Heart, Mail, Github } from "lucide-react";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            <span>© {currentYear} Morina Light</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Todos os direitos reservados</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="mailto:ops@morina.ai"
              className="flex items-center gap-2 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] transition-colors hover:text-[var(--primary)]"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Suporte</span>
            </Link>
            <Link
              href="https://github.com/fabriciofcastro/morinalight"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] transition-colors hover:text-[var(--primary)]"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <div className="flex items-center gap-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              <span>Feito com</span>
              <Heart className="h-4 w-4 fill-[var(--primary)] text-[var(--primary)]" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

