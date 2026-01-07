import { Can } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { RefObject } from "react";
import { menuItemStyles, userMenuButtonStyles, userMenuDropdownStyles } from "../EnterpriseHeader.styles";

interface UserMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    menuRef: RefObject<HTMLDivElement>;
    onNavigate: (path: string) => void;
    onLogout: () => void;
}

export function UserMenu({ isOpen, onToggle, menuRef, onNavigate, onLogout }: UserMenuProps) {
    return (
        <div className="relative" ref={menuRef}>
            <div className="group relative">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={isOpen ? "Fechar menu do usuário" : "Abrir menu do usuário"}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className={userMenuButtonStyles}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-none bg-gradient-to-br from-[hsl(var(--primary)/0.9)] via-[hsl(var(--primary)/0.7)] to-[hsl(var(--accent)/0.8)] shadow-sm">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-white">Fabrício Castro</p>
                        <p className="text-[10px] text-white/60">Administrador</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
                    <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        role="menu"
                        aria-orientation="vertical"
                        className={userMenuDropdownStyles}
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => onNavigate("/profile")}
                            className={menuItemStyles({ intent: "default" })}
                            aria-label="Ir para meu perfil"
                        >
                            <User className="h-4 w-4" />
                            Meu Perfil
                        </button>
                        <Can I="read" a="Settings">
                            {/* Link behaves slightly differently than button, wrap it or use onClick on Link */}
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => onNavigate("/settings")}
                                className={menuItemStyles({ intent: "default" })}
                                aria-label="Ir para configurações"
                            >
                                <SettingsIcon className="h-4 w-4" />
                                Configurações
                            </button>
                        </Can>
                        <div className="my-2 h-px bg-white/10" />
                        <button
                            type="button"
                            role="menuitem"
                            onClick={onLogout}
                            className={menuItemStyles({ intent: "danger" })}
                            title="Sair do sistema (Ctrl+Shift+Q)"
                            aria-label="Sair do sistema"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
