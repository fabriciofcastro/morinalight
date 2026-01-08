"use client";

import { InactivityWarning } from "@/components/auth/InactivityWarning";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { useEnterpriseHeader } from "@/presentation/hooks/use-enterprise-header";
import { cn } from "@morina/ui";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderActions } from "./components/HeaderActions";
import { HeaderSearch } from "./components/HeaderSearch";
import { UserMenu } from "./components/UserMenu";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = (pathname || "").split('/').filter(Boolean);

  return (
    <div className="hidden md:flex items-center gap-2 text-xs font-medium tracking-tight">
      <Link 
        href="/dashboard" 
        className="flex items-center text-white/40 hover:text-[#2957ff] transition-colors gap-1 group cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span className="group-hover:translate-x-0.5 transition-transform">Dashboards</span>
      </Link>
      
      {segments
        .filter((s, i) => !(s.toLowerCase() === "dashboard" && i === 0))
        .map((segment, index) => {
          // Find original index for correct href
          const originalIndex = segments.findIndex((s, i) => s === segment && i >= index);
          const href = `/${segments.slice(0, originalIndex + 1).join("/")}`;
          const isLast = segments.indexOf(segment, index) === segments.lastIndexOf(segment); // Approximation or just use filtered list logic
          
          // Use filtered list index for isLast check
          const isActuallyLast = segments.filter((s, i) => !(s.toLowerCase() === "dashboard" && i === 0)).length - 1 === index;

          return (
            <div key={`breadcrumb-segment-${segment}-${index}`} className="flex items-center gap-2">
              <span className="text-white/20 select-none">|</span>
              <Link 
                  href={href}
                  className={cn(
                      "transition-all duration-200 cursor-pointer capitalize",
                      isActuallyLast 
                          ? "text-white font-semibold" 
                          : "text-white/40 hover:text-white/80"
                  )}
              >
                {segment.replace(/-/g, ' ')}
              </Link>
            </div>
          );
        })}
    </div>
  );
}

export function EnterpriseHeader() {
  const {
      logoutDialogOpen,
      setLogoutDialogOpen,
      handleLogout,
      openLogoutDialog,
      hasUnsavedChanges,
      inactivityWarning,
      timeRemaining,
      extendSession,
      navigateTo
  } = useEnterpriseHeader();

  // Format time remaining for HUD display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining < 300; // Less than 5 mins

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Visual Background Layers */}
      <div className="absolute inset-0 bg-[#090b16]/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#090b16]/75 border-b border-white/5" />
      
      {/* Horizontal Scanning Beam (Subtle Top) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2957ff]/60 to-transparent z-10" />
      
      {/* HUD Corner Brackets (More refined) */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#2957ff]/40 z-10" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#2957ff]/40 z-10" />
      
      {/* Bottom Accent Decor (Thin Cyan gradient) */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#2957ff]/20 to-transparent" />
      
      <div className="relative flex h-16 items-center px-6 gap-6">
        {/* Left Section: Breadcrumbs (Context) */}
        <div className="flex-1 flex items-center gap-6">
           <div className="flex items-center gap-4">
             {/* Environment HUD Indicator */}
             <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/5 font-mono">
               <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
               <span className="text-[9px] text-white/50 uppercase tracking-widest">ENV::PROD</span>
             </div>
             
             <Breadcrumbs />
           </div>
           
           {/* Divider */}
           <div className="h-4 w-px bg-white/10 hidden md:block" />

           {/* Search / Command Trigger */}
           <HeaderSearch />
        </div>

        {/* Right Section: Actions & User */}
        <div className="flex items-center gap-4">
           {/* Session Timer HUD */}
          <div className={cn(
            "hidden xl:flex flex-col text-right mr-2 transition-all duration-300",
            isLowTime ? "animate-pulse" : "opacity-60"
          )}>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Sess_Expiry::</span>
              <span className={cn(
                "text-[10px] font-mono font-bold tracking-tighter",
                isLowTime ? "text-red-400" : "text-[#2957ff]"
              )}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="h-[2px] w-full bg-white/5 mt-0.5 rounded-full overflow-hidden">
               <motion.div 
                  className={cn("h-full", isLowTime ? "bg-red-500" : "bg-[#2957ff]")}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeRemaining / 3600) * 100}%` }}
                  transition={{ duration: 1 }}
               />
            </div>
          </div>

          <HeaderActions />

          <div className="h-6 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
          
          <UserMenu 
              onNavigate={navigateTo}
              onLogout={openLogoutDialog}
          />
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onLogout={handleLogout}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Inactivity Warning */}
      <InactivityWarning
        open={inactivityWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
        onLogout={() => handleLogout(false)}
      />
    </header>
  );
}
