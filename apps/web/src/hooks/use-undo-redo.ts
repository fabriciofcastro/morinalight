import { useState, useCallback, useRef, useEffect } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialValue: T, maxHistory: number = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialValue,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const setValue = useCallback(
    (newValue: T) => {
      setHistory((current) => {
        const newPast = [...current.past, current.present].slice(-maxHistory);
        return {
          past: newPast,
          present: newValue,
          future: [], // Limpar futuro ao fazer nova alteração
        };
      });
    },
    [maxHistory],
  );

  const undo = useCallback(() => {
    if (!canUndo) return;

    setHistory((current) => {
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);
      const newFuture = [current.present, ...current.future];

      return {
        past: newPast,
        present: previous,
        future: newFuture,
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory((current) => {
      const next = current.future[0];
      const newFuture = current.future.slice(1);
      const newPast = [...current.past, current.present];

      return {
        past: newPast,
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const reset = useCallback((newValue: T) => {
    setHistory({
      past: [],
      present: newValue,
      future: [],
    });
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    value: history.present,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}



