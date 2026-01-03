import React from 'react';
import { AnimatedBackground } from '@/components/certifications/backgrounds/AnimatedBackground';

export default function CertificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AnimatedBackground>
            {children}
        </AnimatedBackground>
    );
}
