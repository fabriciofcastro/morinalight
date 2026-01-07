import { useAbility } from "@/lib/auth/CaslContext";
import { parsePermissionKey } from "@/lib/auth/ability";
import type { SidebarItemDefinition } from "@morina/ui";
import { BarChart3, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEPARTMENTS } from "../components/EnterpriseSidebar/EnterpriseSidebar.constants";

export function useEnterpriseSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const ability = useAbility();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // Close search on path change
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname, searchParams]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  const sidebarItems = useMemo<SidebarItemDefinition[]>(() => {
    const items: SidebarItemDefinition[] = [];

    // 1. Static Executive & Dashboard Items
    items.push({
      id: "home",
      label: "Executive Dashboard",
      icon: LayoutDashboard,
      href: "/",
      color: "from-cyan-500 to-blue-500",
    });

    items.push({
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "from-blue-500 to-indigo-500",
    });

    items.push({
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      color: "from-violet-500 to-fuchsia-500",
    });

    // 2. Departments mapping
    DEPARTMENTS.forEach((dept) => {
      // Permission check for department
      if (dept.permission) {
        const { action, subject } = parsePermissionKey(dept.permission);
        if (action && subject && !ability.can(action, subject)) return;
      }

      // Filter solutions by permission
      const visibleSolutions = dept.solutions.filter((sol) => {
        if (!sol.permission) return true;
        const { action, subject } = parsePermissionKey(sol.permission);
        return action && subject ? ability.can(action, subject) : true;
      });

      if (visibleSolutions.length > 0) {
        items.push({
          id: dept.id,
          label: dept.name,
          icon: dept.icon,
          color: dept.color,
          subItems: visibleSolutions.map((s) => ({
            id: s.id,
            label: s.name,
            href: s.path,
            description: s.description,
            icon: s.icon,
          })),
        });
      }
    });

    // 3. Profile / System Menu
    items.push({
      id: "profile-menu",
      label: "Minha Conta",
      icon: User,
      subItems: [
        { id: "profile", label: "Meu Perfil", href: "/profile", icon: User },
        { id: "settings", label: "Configurações", href: "/settings", icon: Settings },
        {
          id: "logout",
          label: "Sair do Sistema",
          action: () => {
            // Placeholder for logout action, replace with actual auth logic or link
            window.location.href = "/api/auth/signout";
          },
          icon: LogOut
        },
      ],
    });

    return items;
  }, [ability]);

  return {
    pathname,
    searchOpen,
    setSearchOpen,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    sidebarItems,
    hoveredItem,
    setHoveredItem,
    isActive
  };
}
