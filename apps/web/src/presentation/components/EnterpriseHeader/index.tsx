"use client";

import { InactivityWarning } from "@/components/auth/InactivityWarning";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { useEnterpriseHeader } from "@/presentation/hooks/use-enterprise-header";
import { HeaderActions } from "./components/HeaderActions";
import { HeaderSearch } from "./components/HeaderSearch";
import { UserMenu } from "./components/UserMenu";
import { headerContainerStyles } from "./EnterpriseHeader.styles";

export function EnterpriseHeader() {
  const {
      userMenuOpen,
      setUserMenuOpen,
      userMenuRef,
      logoutDialogOpen,
      setLogoutDialogOpen,
      hasUnsavedChanges,
      inactivityWarning,
      timeRemaining,
      handleLogout,
      openLogoutDialog,
      extendSession,
      navigateTo
  } = useEnterpriseHeader();

  return (
    <header className={headerContainerStyles}>
      {/* Holo overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 holo-grid" />
        <div className="absolute left-0 top-0 h-full w-[3px] beam-line opacity-60" />
        <div className="absolute right-[12%] top-0 h-full w-[2px] beam-line opacity-30" />
      </div>

      {/* Search */}
      <HeaderSearch />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <HeaderActions />

        {/* User Menu */}
        <UserMenu 
            isOpen={userMenuOpen}
            onToggle={() => setUserMenuOpen(!userMenuOpen)}
            menuRef={userMenuRef}
            onNavigate={navigateTo}
            onLogout={openLogoutDialog}
        />
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
