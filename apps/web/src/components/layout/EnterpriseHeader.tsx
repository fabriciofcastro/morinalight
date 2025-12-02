"use client";

import { Bell, Search, User, ChevronDown, LogOut, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function EnterpriseHeader() {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl px-6">
            {/* Search */}
            <div className="flex flex-1 items-center gap-4 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Buscar em todo o sistema..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {/* Help */}
                <button
                    onClick={() => window.open('/help', '_blank')}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    title="Central de Ajuda"
                    aria-label="Abrir central de ajuda"
                >
                    <HelpCircle className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            3
                        </span>
                    </button>

                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-12 w-80 rounded-xl border border-white/10 bg-[#1E293B] p-4 shadow-xl"
                            >
                                <h3 className="mb-3 text-sm font-bold text-white">Notificações</h3>
                                <div className="space-y-2">
                                    <div className="rounded-lg bg-white/5 p-3">
                                        <p className="text-xs font-medium text-white">Nova comissão aprovada</p>
                                        <p className="mt-1 text-[10px] text-white/50">Há 5 minutos</p>
                                    </div>
                                    <div className="rounded-lg bg-white/5 p-3">
                                        <p className="text-xs font-medium text-white">Cliente adicionado</p>
                                        <p className="mt-1 text-[10px] text-white/50">Há 1 hora</p>
                                    </div>
                                    <div className="rounded-lg bg-white/5 p-3">
                                        <p className="text-xs font-medium text-white">Relatório disponível</p>
                                        <p className="mt-1 text-[10px] text-white/50">Há 2 horas</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-all"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-white">Fabrício Castro</p>
                            <p className="text-[10px] text-white/50">Administrador</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-white/50" />
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-[#1E293B] p-2 shadow-xl"
                            >
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <User className="h-4 w-4" />
                                    Meu Perfil
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    Configurações
                                </Link>
                                <div className="my-2 h-px bg-white/10" />
                                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
