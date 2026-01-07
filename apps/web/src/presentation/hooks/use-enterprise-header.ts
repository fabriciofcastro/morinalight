import { useLogout } from "@/hooks/use-logout"; // Reusing existing hook or check if it needs refactor?
// The user request said "Extract logout/inactivity logic to use-enterprise-header.ts"
// But `useLogout` already exists in `src/hooks/use-logout.ts`. 
// I should probably wrap it or if `useLogout` is clean enough, just use it.
// Let's check `useLogout` first. Assuming it's good, I will compose it.
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function useEnterpriseHeader() {
    const router = useRouter();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    
    // Existing Hook Usage
    const {
        logoutDialogOpen,
        setLogoutDialogOpen,
        hasUnsavedChanges,
        inactivityWarning,
        timeRemaining,
        handleLogout,
        openLogoutDialog,
        extendSession,
    } = useLogout();

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuOpen]);
    
    const navigateTo = (path: string) => {
        setUserMenuOpen(false);
        router.push(path);
    }

    return {
        router,
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
    };
}
