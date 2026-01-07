"use client";

export function FloatingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
            {/* Orb 1 - Primary */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
                style={{
                    background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
                    animation: "float-1 60s ease-in-out infinite",
                    top: "10%",
                    left: "20%",
                }}
            />

            {/* Orb 2 - Secondary */}
            <div
                className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
                style={{
                    background: "radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)",
                    animation: "float-2 50s ease-in-out infinite",
                    bottom: "15%",
                    right: "25%",
                }}
            />

            {/* Orb 3 - Accent */}
            <div
                className="absolute w-[350px] h-[350px] rounded-full blur-[90px]"
                style={{
                    background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
                    animation: "float-3 55s ease-in-out infinite",
                    top: "50%",
                    right: "15%",
                }}
            />

            {/* @ts-ignore */}
            <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 40px) scale(1.15); }
          66% { transform: translate(25px, -35px) scale(0.85); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(35px, 45px) scale(0.9); }
          66% { transform: translate(-30px, -40px) scale(1.1); }
        }
      `}</style>
        </div>
    );
}
