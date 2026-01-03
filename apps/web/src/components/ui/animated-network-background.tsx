"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

interface AnimatedNetworkBackgroundProps {
    color?: string;
    density?: number;
    interactionRadius?: number;
    className?: string;
    children?: React.ReactNode;
}

export function AnimatedNetworkBackground({
    color = "14, 165, 233", // Default blue-500
    density = 80,
    interactionRadius = 150,
    className = "",
    children,
}: AnimatedNetworkBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const resize = () => {
            if (containerRef.current) {
                width = containerRef.current.clientWidth;
                height = containerRef.current.clientHeight;
                canvas.width = width;
                canvas.height = height;
                initParticles();
            }
        };

        const initParticles = () => {
            particlesRef.current = [];
            const particleCount = Math.floor((width * height) / (20000 - density * 100)); // Adjust density logic

            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                });
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Draw connections
            particlesRef.current.forEach((p, i) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Mouse interaction
                const dxMouse = mouseRef.current.x - p.x;
                const dyMouse = mouseRef.current.y - p.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < interactionRadius) {
                    const force = (interactionRadius - distMouse) / interactionRadius;
                    p.x -= (dxMouse / distMouse) * force * 1.5; // Push away slightly
                    p.y -= (dyMouse / distMouse) * force * 1.5;
                }

                // Draw connections between particles
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const p2 = particlesRef.current[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${color}, ${1 - dist / 120})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Draw particle
                ctx.beginPath();
                ctx.fillStyle = `rgba(${color}, 0.8)`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                mouseRef.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                };
            }
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);

        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, density, interactionRadius]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden w-full h-full min-h-screen bg-slate-950 ${className}`}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-0"
            />
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
