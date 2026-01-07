"use client";

export function RadialPulse() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
            {/* Center pulse */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    width: "800px",
                    height: "800px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, hsl(var(--success)) 0%, transparent 70%)",
                    animation: "pulse-expand 50s ease-in-out infinite",
                }}
            />

            {/* Secondary pulse */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    width: "600px",
                    height: "600px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
                    animation: "pulse-expand-delayed 50s ease-in-out infinite",
                    animationDelay: "2s",
                }}
            />

            {/* @ts-ignore */}
            <style jsx>{`
        @keyframes pulse-expand {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.08; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.12; }
        }
        
        @keyframes pulse-expand-delayed {
          0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.06; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
        }
      `}</style>
        </div>
    );
}
