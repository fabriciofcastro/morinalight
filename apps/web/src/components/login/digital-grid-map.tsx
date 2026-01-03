"use client";

import { useEffect, useRef } from "react";

export function DigitalGridMap() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const points: { x: number; y: number; opacity: number; speed: number }[] = [];
        const maxPoints = 50;

        for (let i = 0; i < maxPoints; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                opacity: Math.random(),
                speed: 0.5 + Math.random() * 1.5
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Grid
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.lineWidth = 1;
            const gridSize = 100;

            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw Digital Points
            points.forEach(point => {
                point.y += point.speed;
                if (point.y > height) {
                    point.y = 0;
                    point.x = Math.random() * width;
                }

                ctx.fillStyle = `rgba(var(--primary-rgb), ${point.opacity * 0.5})`; // Assuming primary color variable availability or fallback
                // Fallback color if variable not available in canvas context directly without helper
                ctx.fillStyle = `rgba(56, 189, 248, ${point.opacity * 0.3})`; // Cyan-ish fallback

                ctx.beginPath();
                ctx.rect(point.x, point.y, 2, 15); // Digital rain drop shape
                ctx.fill();
            });

            requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none opacity-40"
        />
    );
}
