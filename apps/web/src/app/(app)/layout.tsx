"use client";

import Link from "next/link";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { EnterpriseHeader } from "@/components/layout/EnterpriseHeader";
import { PageBackground } from "@/components/layout/PageBackground";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Dynamic Background */}
      <PageBackground />

      {/* Sidebar */}
      <EnterpriseSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Header */}
        <EnterpriseHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#0F172A]/80 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-4">
              <span>&copy; 2025 Morina Têxtil</span>
              <span className="h-3 w-px bg-white/20" />
              <span>v2.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/termos" className="hover:text-white/70 transition-colors">Termos</Link>
              <Link href="/privacidade" className="hover:text-white/70 transition-colors">Privacidade</Link>
              <Link href="/lgpd" className="hover:text-white/70 transition-colors">LGPD</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
