import type { LucideIcon } from "lucide-react";

export interface Solution {
  id: string;
  name: string;
  path: string;
  icon?: LucideIcon;
  description?: string;
  permission?: string;
}

export interface Department {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  solutions: Solution[];
  permission?: string;
}

export interface SidebarItemProps {
    id: string;
    icon: LucideIcon;
    label: string;
    active?: boolean;
    color?: string;
    onClick?: () => void;
    href?: string;
    badge?: number;
    dept?: Department;
    hoveredItem: string | null;
    setHoveredItem: (id: string | null) => void;
    isActive: (path: string) => boolean;
    permission?: string;
}
