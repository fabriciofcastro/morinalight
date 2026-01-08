"use client";

import { useEnterpriseSidebar } from "@/presentation/hooks/use-enterprise-sidebar";
import { Sidebar } from "@morina/ui";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { SidebarSearch } from "./components/SidebarSearch";

export function EnterpriseSidebar() {
  const {
      pathname,
      searchOpen,
      setSearchOpen,
      searchInputRef,
      searchQuery,
      setSearchQuery,
      sidebarItems,
  } = useEnterpriseSidebar();

  return (
    <>
      <Sidebar
        items={sidebarItems}
        activePath={pathname || ""}
        onSearch={() => setSearchOpen(true)}
        header={
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-[0_0_18px_hsl(var(--primary)/0.35)] hover:scale-105 transition-transform duration-300 rounded-none"
          >
            <Building2 className="h-5 w-5 text-white" />
          </Link>
        }
      />
      
      <SidebarSearch 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          inputRef={searchInputRef}
      />
    </>
  );
}
