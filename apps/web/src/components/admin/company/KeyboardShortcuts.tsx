"use client";

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ["Ctrl", "S"],
    description: "Salvar alterações",
    category: "Geral",
  },
  {
    keys: ["Ctrl", "Z"],
    description: "Desfazer",
    category: "Geral",
  },
  {
    keys: ["Ctrl", "Shift", "Z"],
    description: "Refazer",
    category: "Geral",
  },
  {
    keys: ["Ctrl", "K"],
    description: "Buscar CNPJ",
    category: "Ações",
  },
  {
    keys: ["Ctrl", "E"],
    description: "Exportar tema",
    category: "Tema",
  },
  {
    keys: ["Ctrl", "I"],
    description: "Importar tema",
    category: "Tema",
  },
  {
    keys: ["Esc"],
    description: "Fechar diálogos",
    category: "Navegação",
  },
];

export function KeyboardShortcuts({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => new Set([...prev, e.key]));

      // Atalho para abrir ajuda (Ctrl + ?)
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Fechar com Esc
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleKeyUp = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      Control: "Ctrl",
      Meta: "Cmd",
      Shift: "Shift",
      Alt: "Alt",
      Escape: "Esc",
      Enter: "Enter",
      Backspace: "Backspace",
      Delete: "Del",
    };

    return keyMap[key] || key;
  };

  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[hsl(var(--primary))] text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center",
          className,
        )}
        title="Atalhos de teclado (Ctrl + /)"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-[#121212] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                      <Keyboard className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Atalhos de Teclado</h3>
                      <p className="text-xs text-zinc-400">Pressione Ctrl + / para abrir este painel</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5 text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                  {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-white mb-3">{category}</h4>
                      <div className="space-y-2">
                        {shortcuts.map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5"
                          >
                            <span className="text-sm text-zinc-300">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <span key={keyIndex}>
                                  <kbd className="px-2 py-1 text-xs font-medium rounded bg-white/10 text-white border border-white/20">
                                    {formatKey(key)}
                                  </kbd>
                                  {keyIndex < shortcut.keys.length - 1 && (
                                    <span className="mx-1 text-zinc-500">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



