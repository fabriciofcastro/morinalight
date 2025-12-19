/**
 * Hook para navegação por teclado acessível
 */

import { useCallback, useEffect, useRef } from "react";

export interface KeyboardNavigationOptions {
  /** Callback quando Enter é pressionado */
  onEnter?: (event: KeyboardEvent) => void;
  /** Callback quando Escape é pressionado */
  onEscape?: (event: KeyboardEvent) => void;
  /** Callback quando Space é pressionado */
  onSpace?: (event: KeyboardEvent) => void;
  /** Callback para setas (ArrowUp, ArrowDown, ArrowLeft, ArrowRight) */
  onArrow?: (direction: "up" | "down" | "left" | "right", event: KeyboardEvent) => void;
  /** Callback para Tab */
  onTab?: (event: KeyboardEvent) => void;
  /** Callback para Shift+Tab */
  onShiftTab?: (event: KeyboardEvent) => void;
  /** Callback customizado para outras teclas */
  onKeyDown?: (key: string, event: KeyboardEvent) => void;
  /** Se true, previne comportamento padrão */
  preventDefault?: boolean;
  /** Se true, adiciona event listener ao elemento atual */
  attachToElement?: boolean;
}

/**
 * Hook para gerenciar navegação por teclado
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onEscape,
    onSpace,
    onArrow,
    onTab,
    onShiftTab,
    onKeyDown,
    preventDefault = false,
    attachToElement = false,
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, shiftKey } = event;

      // Previne comportamento padrão se solicitado
      if (preventDefault) {
        event.preventDefault();
      }

      // Handlers específicos
      switch (key) {
        case "Enter":
          onEnter?.(event);
          break;
        case "Escape":
        case "Esc":
          onEscape?.(event);
          break;
        case " ":
          onSpace?.(event);
          break;
        case "ArrowUp":
          onArrow?.("up", event);
          break;
        case "ArrowDown":
          onArrow?.("down", event);
          break;
        case "ArrowLeft":
          onArrow?.("left", event);
          break;
        case "ArrowRight":
          onArrow?.("right", event);
          break;
        case "Tab":
          if (shiftKey) {
            onShiftTab?.(event);
          } else {
            onTab?.(event);
          }
          break;
        default:
          onKeyDown?.(key, event);
      }
    },
    [onEnter, onEscape, onSpace, onArrow, onTab, onShiftTab, onKeyDown, preventDefault],
  );

  // Adiciona event listener se attachToElement for true
  useEffect(() => {
    if (attachToElement && elementRef.current) {
      const element = elementRef.current;
      element.addEventListener("keydown", handleKeyDown as EventListener);
      return () => {
        element.removeEventListener("keydown", handleKeyDown as EventListener);
      };
    }
  }, [attachToElement, handleKeyDown]);

  // Retorna handler para usar em elementos React
  return {
    onKeyDown: handleKeyDown as React.KeyboardEventHandler,
    ref: elementRef,
  };
}

/**
 * Hook para gerenciar foco (trap focus em modais)
 */
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Foca no primeiro elemento
    firstElement.focus();

    container.addEventListener("keydown", handleTabKey);

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook para skip links (pular para conteúdo principal)
 */
export function useSkipLink(targetId: string = "main-content") {
  const handleSkip = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [targetId]);

  return { handleSkip };
}

