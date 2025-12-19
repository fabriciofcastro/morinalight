"use client";

import { useEffect, useCallback } from "react";

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
};

/**
 * Hook para gerenciar atalhos de teclado globais
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Atalhos de teclado padrão do sistema
 */
export const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: "k",
    ctrl: true,
    action: () => {
      // Abrir busca global (pode ser implementado depois)
      console.log("Global search");
    },
    description: "Busca global",
  },
  {
    key: "q",
    ctrl: true,
    shift: true,
    action: () => {
      // Logout (já implementado em outros lugares)
      console.log("Logout");
    },
    description: "Sair",
  },
  {
    key: "n",
    ctrl: true,
    action: () => {
      // Criar novo item (contextual)
      console.log("Create new");
    },
    description: "Criar novo",
  },
  {
    key: "s",
    ctrl: true,
    action: () => {
      // Salvar (contextual)
      console.log("Save");
    },
    description: "Salvar",
    preventDefault: false, // Não prevenir default em formulários
  },
];


