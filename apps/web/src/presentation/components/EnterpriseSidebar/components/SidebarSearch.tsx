import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { RefObject } from "react";

interface SidebarSearchProps {
    isOpen: boolean;
    onClose: () => void;
    query: string;
    onQueryChange: (query: string) => void;
    inputRef: RefObject<HTMLInputElement>;
}

export function SidebarSearch({ isOpen, onClose, query, onQueryChange, inputRef }: SidebarSearchProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl overflow-hidden bg-[#0A0D14] border border-white/10 shadow-2xl rounded-none"
                    >
                        <div className="flex items-center border-b border-white/10 px-4 py-3">
                            <Search className="mr-3 h-5 w-5 text-white/50" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Buscar recursos, páginas ou configurações..."
                                className="flex-1 bg-transparent text-lg text-white placeholder-white/30 focus:outline-none"
                                value={query}
                                onChange={(e) => onQueryChange(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-block rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-light text-white/50">
                                    ESC
                                </kbd>
                                <button onClick={onClose}>
                                    <X className="h-5 w-5 text-white/50 hover:text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-2">
                            {query ? (
                                <div className="px-4 py-12 text-center text-white/40">
                                    Buscando por "{query}"...
                                </div>
                            ) : (
                                <div className="px-4 py-12 text-center text-white/40">
                                    Digite para buscar...
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
