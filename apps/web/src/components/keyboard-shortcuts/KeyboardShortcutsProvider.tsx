"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/lib/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsContextValue {
  shortcuts: KeyboardShortcut[];
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
  shortcuts?: KeyboardShortcut[];
}

export function KeyboardShortcutsProvider({
  children,
  shortcuts = [],
}: KeyboardShortcutsProviderProps) {
  useKeyboardShortcuts(shortcuts);

  return (
    <KeyboardShortcutsContext.Provider value={{ shortcuts }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider");
  }
  return context;
}


