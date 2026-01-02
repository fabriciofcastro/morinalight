"use client";

import { PlaybookHero } from "@/components/playbook/playbook-hero";
import { PlaybookFeatures } from "@/components/playbook/playbook-features";
import { PlaybookMetrics } from "@/components/playbook/playbook-metrics";
import { PlaybookRoadmap } from "@/components/playbook/playbook-roadmap";
import { PlaybookArchitecture } from "@/components/playbook/playbook-architecture";

export default function PlaybookPage() {
  return (
    <main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* Global Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),#020617)]" />

      {/* Content Sections */}
      <PlaybookHero />
      <PlaybookFeatures />
      <PlaybookMetrics />
      <PlaybookRoadmap />
      <PlaybookArchitecture />

      {/* Footer Gradient */}
      <div className="relative h-32 bg-gradient-to-t from-[#020617] to-transparent" />
    </main>
  );
}
