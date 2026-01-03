"use client";

export function DiagonalLines() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.06]">
            {/* Diagonal lines pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(45deg, hsl(var(--accent)) 1px, transparent 1px),
            linear-gradient(-45deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                    animation: "diagonal-move 40s linear infinite",
                }}
            />

            <style jsx>{`
        @keyframes diagonal-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
      `}</style>
        </div>
    );
}
