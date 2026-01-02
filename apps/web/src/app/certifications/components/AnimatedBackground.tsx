/**
 * Animated Background Component
 * 
 * Gradient mesh + particles + aurora + grid
 */

'use client';

import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0f]">
      {/* Gradient Mesh */}
      <GradientMesh />

      {/* Particle System */}
      <ParticleSystem />

      {/* Aurora Effect */}
      <AuroraEffect />

      {/* Holographic Grid */}
      <HolographicGrid />
    </div>
  );
}

/**
 * Gradient Mesh - Animated gradients
 */
function GradientMesh() {
  return (
    <div className="absolute inset-0">
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />
      <div className="gradient-blob gradient-blob-4" />

      <style jsx>{`
        .gradient-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }
        
        .gradient-blob-1 {
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }
        
        .gradient-blob-2 {
          background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
          top: -10%;
          right: -10%;
          animation-delay: 5s;
        }
        
        .gradient-blob-3 {
          background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
          bottom: -10%;
          right: -10%;
          animation-delay: 10s;
        }
        
        .gradient-blob-4 {
          background: radial-gradient(circle, #ec4899 0%, transparent 70%);
          bottom: -10%;
          left: -10%;
          animation-delay: 15s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          75% {
            transform: translate(30px, 50px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Particle System - Canvas-based particles
 */
function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // After this point, canvas is guaranteed to be non-null

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * (canvas?.width ?? 0);
        this.y = Math.random() * (canvas?.height ?? 0);
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        const width = canvas?.width ?? 0;
        const height = canvas?.height ?? 0;
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connect nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/**
 * Aurora Effect - SVG-based aurora
 */
function AuroraEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
          </linearGradient>

          <filter id="aurora-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
        </defs>

        <path
          d="M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100 V200 H0 Z"
          fill="url(#aurora-gradient)"
          filter="url(#aurora-blur)"
          className="aurora-wave"
        />

        <path
          d="M0,150 Q250,100 500,150 T1000,150 T1500,150 T2000,150 V250 H0 Z"
          fill="url(#aurora-gradient)"
          filter="url(#aurora-blur)"
          className="aurora-wave aurora-wave-2"
        />
      </svg>

      <style jsx>{`
        .aurora-wave {
          animation: aurora 15s ease-in-out infinite;
        }
        
        .aurora-wave-2 {
          animation-delay: 7.5s;
        }
        
        @keyframes aurora {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) scaleY(1.2);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Holographic Grid - CSS-based grid
 */
function HolographicGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div className="holographic-grid" />

      <style jsx>{`
        .holographic-grid {
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(90deg, transparent 98%, rgba(99, 102, 241, 0.3) 100%),
            linear-gradient(0deg, transparent 98%, rgba(99, 102, 241, 0.3) 100%);
          background-size: 50px 50px;
          transform: perspective(1000px) rotateX(60deg) translateY(-50%);
          animation: gridMove 30s linear infinite;
        }
        
        @keyframes gridMove {
          0% {
            transform: perspective(1000px) rotateX(60deg) translateY(-50%) translateZ(0);
          }
          100% {
            transform: perspective(1000px) rotateX(60deg) translateY(-50%) translateZ(500px);
          }
        }
      `}</style>
    </div>
  );
}
