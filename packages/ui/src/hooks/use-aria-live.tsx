"use client";

/**
 * Hook para gerenciar aria-live regions (notificações para screen readers)
 */

import { useEffect, useRef, useState } from "react";

export interface UseAriaLiveOptions {
  /** Prioridade da mensagem (polite ou assertive) */
  priority?: "polite" | "assertive";
  /** Tempo em ms antes de limpar a mensagem (0 = não limpa) */
  clearAfter?: number;
}

export interface AriaLiveMessage {
  id: string;
  message: string;
  priority: "polite" | "assertive";
  timestamp: number;
}

/**
 * Hook para anunciar mensagens para screen readers
 */
export function useAriaLive(options: UseAriaLiveOptions = {}) {
  const { priority = "polite", clearAfter = 0 } = options;
  const [messages, setMessages] = useState<AriaLiveMessage[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = (message: string, messagePriority: "polite" | "assertive" = priority) => {
    const newMessage: AriaLiveMessage = {
      id: `aria-live-${Date.now()}-${Math.random()}`,
      message,
      priority: messagePriority,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Limpar mensagem após tempo especificado
    if (clearAfter > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
      }, clearAfter);
    }
  };

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    announce,
    messages,
    clearMessages: () => setMessages([]),
  };
}

/**
 * Componente para renderizar aria-live regions
 */
export function AriaLiveRegion({ messages }: { messages: AriaLiveMessage[] }) {
  const politeMessages = messages.filter((m) => m.priority === "polite");
  const assertiveMessages = messages.filter((m) => m.priority === "assertive");

  return (
    <>
      {politeMessages.length > 0 && (
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {politeMessages[politeMessages.length - 1]?.message}
        </div>
      )}
      {assertiveMessages.length > 0 && (
        <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
          {assertiveMessages[assertiveMessages.length - 1]?.message}
        </div>
      )}
    </>
  );
}
