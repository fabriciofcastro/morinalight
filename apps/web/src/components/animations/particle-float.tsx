"use client";

export function ParticleFloat() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
            {/* Particle 1 */}
            <div
                className="absolute w-2 h-2 rounded-full"
                style={{
                    background: "hsl(var(--secondary))",
                    top: "20%",
                    left: "15%",
                    animation: "particle-float-1 55s ease-in-out infinite",
                }}
            />

            {/* Particle 2 */}
            <div
                className="absolute w-3 h-3 rounded-full"
                style={{
                    background: "hsl(var(--accent))",
                    top: "60%",
                    left: "70%",
                    animation: "particle-float-2 60s ease-in-out infinite",
                }}
            />

            {/* Particle 3 */}
            <div
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                    background: "hsl(var(--primary))",
                    top: "40%",
                    right: "20%",
                    animation: "particle-float-3 50s ease-in-out infinite",
                }}
            />

            {/* Particle 4 */}
            <div
                className="absolute w-2 h-2 rounded-full"
                style={{
                    background: "hsl(var(--secondary))",
                    bottom: "30%",
                    left: "40%",
                    animation: "particle-float-4 58s ease-in-out infinite",
                }}
            />

            {/* @ts-ignore */}
            <style jsx>{`
        @keyframes particle-float-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(100px, -80px); }
          50% { transform: translate(200px, 50px); }
          75% { transform: translate(50px, 120px); }
        }
        
        @keyframes particle-float-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-120px, 90px); }
          50% { transform: translate(-50px, -100px); }
          75% { transform: translate(80px, -50px); }
        }
        
        @keyframes particle-float-3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-90px, -70px); }
          50% { transform: translate(60px, -130px); }
          75% { transform: translate(-40px, 60px); }
        }
        
        @keyframes particle-float-4 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(110px, 80px); }
          50% { transform: translate(-70px, 40px); }
          75% { transform: translate(30px, -90px); }
        }
      `}</style>
        </div>
    );
}
