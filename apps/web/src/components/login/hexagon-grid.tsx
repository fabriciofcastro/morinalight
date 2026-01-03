"use client";

import { useEffect, useRef } from "react";

export function HexagonGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const hexSize = 30;
        const hexHeight = hexSize * 2;
        const hexWidth = Math.sqrt(3) * hexSize;
        const vertDist = hexHeight * 3 / 4;

        const drawHexagon = (x: number, y: number, opacity: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = 2 * Math.PI / 6 * i;
                const x_i = x + hexSize * Math.cos(angle);
                const y_i = y + hexSize * Math.sin(angle);
                if (i === 0) ctx.moveTo(x_i, y_i);
                else ctx.lineTo(x_i, y_i);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            const time = Date.now() * 0.001;

            for (let r = 0; r < height / vertDist + 2; r++) {
                for (let c = 0; c < width / hexWidth + 2; c++) {
                    const x = c * hexWidth + (r % 2) * (hexWidth / 2);
                    const y = r * vertDist;

                    // Create a wave effect
                    const dist = Math.sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2);
                    const opacity = (Math.sin(dist * 0.01 - time) + 1) * 0.05;

                    if (opacity > 0.01) {
                        drawHexagon(x, y, opacity);
                    }
                }
            }

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
            className="absolute inset-0 pointer-events-none opacity-20"
        />
    );
}
