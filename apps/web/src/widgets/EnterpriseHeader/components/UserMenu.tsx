"use client";

import { Can } from "@/lib/auth";
import { Avatar } from "@/shared/ui/base/avatar";
import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface UserMenuProps {
    onNavigate: (path: string) => void;
    onLogout: () => void;
}

export function UserMenu({ onNavigate, onLogout }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleLogoutClick = () => {
        setIsOpen(false);
        onLogout();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-lg border border-transparent transition-all cursor-pointer group select-none relative z-20",
                    isOpen ? "bg-[#090b16]/80 border-cyan-500/30" : "hover:bg-white/5 hover:border-white/10"
                )}
            >
                <div className="relative">
                     {/* Corner Borders Hover Effect (90 deg corners) */}
                     <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#2957ff]/70" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#2957ff]/70" />
                     </div>

                    <Avatar 
                        className="h-8 w-8 ring-1 ring-white/10 group-hover:ring-[#2957ff]/50 transition-all" 
                        src="" 
                        alt="Fabrício Castro"
                        fallback="FC"
                        size="xs"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#090b16] rounded-full" />
                </div>
                
                <div className="hidden text-left md:block">
                    <p className={cn(
                        "text-xs font-semibold leading-none text-white transition-colors",
                         "group-hover:text-[#2957ff]"
                    )}>
                        Fabrício Castro
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5 group-hover:text-white/70">Admin</p>
                </div>
                
                <ChevronDown className={cn(
                    "w-4 h-4 text-white/30 transition-transform duration-200 group-hover:text-[#2957ff]/70",
                    isOpen && "text-[#2957ff]"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-60 z-50"
                    >
                        <div className="relative border border-[#2957ff]/30 bg-[color-mix(in_oklab,#030712_90%,#000_10%)] backdrop-blur-xl shadow-[0_28px_140px_-48px_rgba(41,87,255,0.4)] overflow-hidden">
                            {/* HUD overlays */}
                            <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                                <div className="absolute inset-0 holo-grid opacity-30" />
                                <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#2957ff]/40 to-transparent" />
                                <div className="absolute right-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#2957ff]/25 to-transparent" />
                            </div>

                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#2957ff]/50" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#2957ff]/50" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#2957ff]/50" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#2957ff]/50" />
                            
                            <div className="relative p-2">
                                <div className="px-3 py-2 mb-1 border-b border-white/10 bg-gradient-to-r from-[#2957ff]/5 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-[#2957ff] rounded-full animate-pulse shadow-[0_0_8px_rgba(41, 87, 255, 0.8)]" />
                                        <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">Minha Conta</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { onNavigate("/profile"); setIsOpen(false); }}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:bg-[#2957ff]/10 hover:text-white hover:pl-4 transition-all duration-200 group cursor-pointer border border-transparent hover:border-[#2957ff]/30"
                                >
                                    <User className="h-4 w-4 text-white/40 group-hover:text-[#2957ff] transition-colors" />
                                    <span className="font-medium">Meu Perfil</span>
                                </button>

                                <Can I="read" a="Settings">
                                    <button 
                                        onClick={() => { onNavigate("/settings"); setIsOpen(false); }}
                                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:bg-[#2957ff]/10 hover:text-white hover:pl-4 transition-all duration-200 group cursor-pointer border border-transparent hover:border-[#2957ff]/30"
                                    >
                                        <SettingsIcon className="h-4 w-4 text-white/40 group-hover:text-[#2957ff] transition-colors" />
                                        <span className="font-medium">Configurações</span>
                                    </button>
                                </Can>

                                <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-[#2957ff]/30 to-transparent" />

                                <button 
                                    onClick={handleLogoutClick}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 hover:pl-4 transition-all duration-200 group cursor-pointer border border-transparent hover:border-red-500/30"
                                >
                                    <LogOut className="h-4 w-4 text-red-400/50 group-hover:text-red-400 transition-colors" />
                                    <span className="font-medium">Sair</span>
                                </button>
                            </div>

                            {/* Bottom accent */}
                            <div className="h-1 bg-linear-to-r from-transparent via-[#2957ff]/50 to-transparent" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
