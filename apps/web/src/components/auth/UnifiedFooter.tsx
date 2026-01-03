'use client';

import { Suspense } from 'react';
import { CertificationsBanner } from './CertificationsBanner';
import { CreatorsModule, CreatorsModuleSkeleton } from './CreatorsModule';
import { LegalLinks } from './LegalLinks';

export function UnifiedFooter() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Content container */}
            <div className="relative px-4 sm:px-6 py-6 pointer-events-auto">
                <div className="max-w-[1100px] mx-auto space-y-4">
                    {/* Camada 1: Certificações (Destaque) */}
                    <CertificationsBanner />

                    {/* Camada 2: Grid Responsivo */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
                        {/* Esquerda: Idealizadores */}
                        <Suspense fallback={<CreatorsModuleSkeleton />}>
                            <CreatorsModule />
                        </Suspense>

                        {/* Direita: Links Legais */}
                        <LegalLinks />
                    </div>
                </div>
            </div>
        </footer>
    );
}
