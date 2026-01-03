"use client";

import dynamic from "next/dynamic";

const PlaybookHero = dynamic(() => import("@/components/playbook/playbook-hero").then(mod => mod.PlaybookHero), {
  ssr: true,
});

const PlaybookFeatures = dynamic(() => import("@/components/playbook/playbook-features").then(mod => mod.PlaybookFeatures), {
  ssr: false, // Too heavy for SSR due to complex client-side animations
});

const PlaybookMetrics = dynamic(() => import("@/components/playbook/playbook-metrics").then(mod => mod.PlaybookMetrics), {
  ssr: false,
});

const PlaybookRoadmap = dynamic(() => import("@/components/playbook/playbook-roadmap").then(mod => mod.PlaybookRoadmap), {
  ssr: false,
});

const PlaybookArchitecture = dynamic(() => import("@/components/playbook/playbook-architecture").then(mod => mod.PlaybookArchitecture), {
  ssr: false,
});

const PlaybookShowcase = dynamic(() => import("@/components/playbook/playbook-showcase").then(mod => mod.PlaybookShowcase), {
  ssr: false,
});

const PlaybookTechStack = dynamic(() => import("@/components/playbook/playbook-tech-stack").then(mod => mod.PlaybookTechStack), {
  ssr: false,
});

const PlaybookCTA = dynamic(() => import("@/components/playbook/playbook-cta").then(mod => mod.PlaybookCTA), {
  ssr: false,
});

export default function PlaybookPage() {
  return (
    <main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* Global Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),#020617)]" />

      {/* Content Sections */}
      <PlaybookHero />
      <PlaybookFeatures />
      <PlaybookMetrics />
      <PlaybookShowcase />
      <PlaybookRoadmap />
      <PlaybookArchitecture />
      <PlaybookTechStack />
      <PlaybookCTA />

      {/* Footer Gradient */}
      <div className="relative h-32 bg-gradient-to-t from-[#020617] to-transparent" />
    </main>
  );
}
