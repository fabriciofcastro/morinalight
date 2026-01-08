"use client";

import { Button, cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Power } from "lucide-react";

type InactivityWarningProps = {
  open: boolean;
  timeRemaining: number; // em segundos
  onExtend: () => void;
  onLogout: () => void;
};

export function InactivityWarning({
  open,
  timeRemaining,
  onExtend,
  onLogout,
}: InactivityWarningProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining < 60; // Less than 1 minute

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with enhanced blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden bg-[#0a0f1d]/90 border border-[#2957ff]/20 shadow-[0_0_50px_rgba(41,87,255,0.15)] rounded-none"
            >
              {/* HUD Background Decorations */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(41,87,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(41,87,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2957ff]/50 to-transparent animate-scan z-10" />
                
                {/* 90° Corner Brackets */}
                <div className={cn("absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 transition-colors duration-500", isUrgent ? "border-amber-500/60" : "border-[#2957ff]/60")} />
                <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 transition-colors duration-500", isUrgent ? "border-amber-500/60" : "border-[#2957ff]/60")} />
                <div className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 transition-colors duration-500", isUrgent ? "border-amber-500/60" : "border-[#2957ff]/60")} />
                <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 transition-colors duration-500", isUrgent ? "border-amber-500/60" : "border-[#2957ff]/60")} />
              </div>

              <div className="relative p-8 flex flex-col items-center">
                {/* Top Status Badge */}
                <div className="flex items-center gap-2 mb-6 bg-white/[0.03] border border-white/10 px-3 py-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]", isUrgent ? "bg-amber-500 text-amber-500" : "bg-[#2957ff] text-[#2957ff]")} />
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Session_Status::Critical</span>
                </div>

                {/* Animated Timer HUD Circle */}
                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute inset-0 rounded-full border border-[#2957ff]/10 scale-125" />
                  <div className="absolute inset-0 rounded-full border border-[#2957ff]/5 scale-150" />
                  
                  <div className={cn(
                    "relative flex flex-col items-center justify-center w-40 h-40 rounded-full border-2 transition-all duration-500",
                    isUrgent ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]" : "border-[#2957ff]/40 shadow-[0_0_20px_rgba(41,87,255,0.1)]"
                  )}>
                    <span className={cn(
                      "text-5xl font-mono font-bold tracking-tighter transition-colors duration-500",
                      isUrgent ? "text-amber-400" : "text-white"
                    )}>
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Remaining_Time</span>
                    
                    {/* Pulsing indicator for seconds */}
                    <motion.div
                       className={cn("absolute inset-0 rounded-full border-t-2", isUrgent ? "border-amber-500" : "border-[#2957ff]")}
                       animate={{ rotate: 360 }}
                       transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Inatividade Detectada</h2>
                  <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
                    Sua sessão será encerrada automaticamente para garantir a segurança dos seus dados.
                  </p>
                </div>

                {/* Actions HUD Style */}
                <div className="flex w-full gap-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onLogout} 
                    className="flex-1 font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/5"
                  >
                    <Power className="mr-2 h-3.5 w-3.5" />
                    Encerrar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={onExtend} 
                    className={cn(
                      "flex-1 font-mono text-[11px] uppercase tracking-widest transition-all",
                      isUrgent 
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                        : "bg-[#2957ff] hover:bg-[#2957ff]/80 text-white shadow-[0_0_15px_rgba(41,87,255,0.3)]"
                    )}
                  >
                    Estender_Link
                  </Button>
                </div>
              </div>

              {/* Bottom Decorative Line */}
              <div className={cn("h-1 w-full transition-colors duration-500", isUrgent ? "bg-amber-500" : "bg-[#2957ff]")} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}




