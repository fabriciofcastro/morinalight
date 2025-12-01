"use client";

export function GridShift() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07]">
            {/* Grid pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, hsl(var(--warning)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                    animation: "grid-shift 45s linear infinite",
                }}
            />

            <style jsx>{`
        @keyframes grid-shift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }
      `}</style>
        </div>
    );
}
