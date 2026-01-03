"use client";

import React, { useState } from "react";
import { CertificationLayout } from "./components/certification-layout";
import { CertificationModal } from "@/components/certifications/CertificationModal";
import { Certification } from "@/components/certifications/types";

// Epic Background Components
import { GradientMesh } from "@/components/certifications/backgrounds/GradientMesh";
import { ParticleSystem } from "@/components/certifications/backgrounds/ParticleSystem";
import { AuroraEffect } from "@/components/certifications/backgrounds/AuroraEffect";
import { HolographicGrid } from "@/components/certifications/backgrounds/HolographicGrid";

// Epic Content Components
import { HeroSection } from "@/components/certifications/HeroSection";
import { StatsSection } from "@/components/certifications/StatsSection";
import { TimelineSection } from "@/components/certifications/TimelineSection";
import { CTASection } from "@/components/certifications/CTASection";
import { CertificateCard } from "@/components/certifications/CertificateCard";
import { CERTIFICATIONS } from "@/components/certifications/constants";
import { Shield } from "lucide-react";

export default function CertificationsHubPage() {
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

    const epicBackground = (
        <>
            <GradientMesh />
            <ParticleSystem />
            <AuroraEffect />
            <HolographicGrid />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80 pointer-events-none" />
        </>
    );

    return (
        <CertificationLayout
            title="Security & Compliance"
            subtitle="Transparency is at the core of our security philosophy."
            icon={<Shield className="w-8 h-8 text-white" />}
            background={epicBackground}
        >
            <CertificationModal
                certification={selectedCert}
                onClose={() => setSelectedCert(null)}
            />

            {/* The Layout provides the container, but we want the Epic Background to take over.
                We might need to adjust CertificationLayout to allow full-width or custom backgrounds,
                OR we wrap inner content here.
                
                Given CertificationLayout has its own background logic, we will wrap the main *interactive* content
                with our new sections. 
            */}

            <div className="space-y-24 pb-20">
                {/* 
                    Note: CertificationLayout already has a header. 
                    However, the User requested the Epic HeroSection. 
                    We will render the Epic components as the 'Content' of the layout.
                 */}

                {/* 1. Stats Overview */}
                <StatsSection certifications={CERTIFICATIONS} />

                {/* 2. Main Certifications Grid */}
                <section id="certifications-grid" className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                            Padrões Globais de Segurança
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Cada certificação representa um pilar da nossa arquitetura de defesa em profundidade.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CERTIFICATIONS.map((cert, index) => (
                            <CertificateCard
                                key={cert.id}
                                certification={cert}
                                index={index}
                                onClick={setSelectedCert}
                            />
                        ))}
                    </div>
                </section>

                {/* 3. Timeline of Innovation */}
                <TimelineSection />

                {/* 4. Call to Action */}
                <CTASection />
            </div>
        </CertificationLayout>
    );
}
