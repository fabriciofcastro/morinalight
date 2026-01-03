"use client";

import { FloatingOrbs } from "./animations/floating-orbs";
import { DiagonalLines } from "./animations/diagonal-lines";
import { RadialPulse } from "./animations/radial-pulse";
import { GridShift } from "./animations/grid-shift";
import { ParticleFloat } from "./animations/particle-float";
import { ClientesAnimatedBackground } from "./animations/clientes-animated-background";

type PageBackgroundVariant =
    | "dashboard"
    | "clientes"
    | "representantes"
    | "comissoes"
    | "catalogo"
    | "none";

interface PageBackgroundProps {
    variant: PageBackgroundVariant;
}

export function PageBackground({ variant }: PageBackgroundProps) {
    if (variant === "none") return null;

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {variant === "dashboard" && <FloatingOrbs />}
            {variant === "clientes" && <ClientesAnimatedBackground />}
            {variant === "representantes" && <RadialPulse />}
            {variant === "comissoes" && <GridShift />}
            {variant === "catalogo" && <ParticleFloat />}
        </div>
    );
}
