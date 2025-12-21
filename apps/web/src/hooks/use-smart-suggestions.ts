"use client";

import { useState, useEffect, useMemo } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

export interface SmartSuggestion {
  field: string;
  value: string;
  confidence: number;
  reason: string;
}

interface UseSmartSuggestionsOptions {
  enabled?: boolean;
  minConfidence?: number;
}

export function useSmartSuggestions(
  currentData: Record<string, unknown>,
  options: UseSmartSuggestionsOptions = {}
) {
  const { enabled = true, minConfidence = 0.3 } = options;
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allClientes, setAllClientes] = useState<any[]>([]);

  // Carregar clientes para análise
  useEffect(() => {
    if (!enabled) return;

    const loadClientes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/clientes", {
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAllClientes(data.itens || []);
        }
      } catch (error) {
        console.error("Erro ao carregar clientes para sugestões:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClientes();
  }, [enabled]);

  // Gerar sugestões baseadas em padrões
  const generateSuggestions = useMemo(() => {
    if (!enabled || allClientes.length === 0) return [];

    const newSuggestions: SmartSuggestion[] = [];

    // Sugestões baseadas em tipo de cliente
    if (currentData.tipo) {
      const clientesMesmoTipo = allClientes.filter(
        (c) => c.tipo === currentData.tipo
      );

      // Sugestão de cidade mais comum para este tipo
      const cidades = clientesMesmoTipo
        .map((c) => c.cidade)
        .filter((c) => c);
      const cidadeMaisComum = getMostCommon(cidades);
      if (
        cidadeMaisComum &&
        !currentData.cidade &&
        cidadeMaisComum !== currentData.cidade
      ) {
        newSuggestions.push({
          field: "cidade",
          value: cidadeMaisComum,
          confidence: 0.5,
          reason: `Cidade mais comum para ${currentData.tipo === "fisica" ? "pessoas físicas" : "pessoas jurídicas"}`,
        });
      }

      // Sugestão de estado mais comum
      const estados = clientesMesmoTipo
        .map((c) => c.estado)
        .filter((e) => e);
      const estadoMaisComum = getMostCommon(estados);
      if (
        estadoMaisComum &&
        !currentData.estado &&
        estadoMaisComum !== currentData.estado
      ) {
        newSuggestions.push({
          field: "estado",
          value: estadoMaisComum,
          confidence: 0.5,
          reason: `Estado mais comum para ${currentData.tipo === "fisica" ? "pessoas físicas" : "pessoas jurídicas"}`,
        });
      }
    }

    // Sugestão baseada em padrões de email
    if (currentData.email && !currentData.email.includes("@")) {
      const emails = allClientes
        .map((c) => c.email)
        .filter((e) => e && e.includes("@"));
      const dominios = emails.map((e) => e.split("@")[1]);
      const dominioMaisComum = getMostCommon(dominios);
      if (dominioMaisComum) {
        newSuggestions.push({
          field: "email",
          value: `${currentData.email}@${dominioMaisComum}`,
          confidence: 0.4,
          reason: "Domínio de email mais comum",
        });
      }
    }

    // Sugestão baseada em padrões de telefone (DDD)
    if (currentData.telefone || currentData.celular) {
      const telefone = (currentData.telefone || currentData.celular) as string;
      if (telefone.length >= 2) {
        const ddd = telefone.substring(0, 2);
        const clientesMesmoDDD = allClientes.filter((c) => {
          const tel = c.telefone || c.celular;
          return tel && tel.startsWith(ddd);
        });

        if (clientesMesmoDDD.length > 0) {
          const cidadeMaisComumDDD = getMostCommon(
            clientesMesmoDDD.map((c) => c.cidade).filter((c) => c)
          );
          if (cidadeMaisComumDDD && !currentData.cidade) {
            newSuggestions.push({
              field: "cidade",
              value: cidadeMaisComumDDD,
              confidence: 0.6,
              reason: `Cidade mais comum para DDD ${ddd}`,
            });
          }
        }
      }
    }

    // Sugestão baseada em nome similar
    if (currentData.nome && typeof currentData.nome === "string") {
      const nomeLower = currentData.nome.toLowerCase();
      const clientesSimilares = allClientes.filter((c) => {
        const nomeCliente = (c.nome || "").toLowerCase();
        return (
          nomeCliente.includes(nomeLower.substring(0, 3)) ||
          nomeLower.includes(nomeCliente.substring(0, 3))
        );
      });

      if (clientesSimilares.length > 0) {
        // Sugerir cidade/estado de clientes similares
        const cidadesSimilares = clientesSimilares
          .map((c) => c.cidade)
          .filter((c) => c);
        const cidadeSimilar = getMostCommon(cidadesSimilares);
        if (cidadeSimilar && !currentData.cidade) {
          newSuggestions.push({
            field: "cidade",
            value: cidadeSimilar,
            confidence: 0.4,
            reason: "Cidade de clientes com nome similar",
          });
        }
      }
    }

    return newSuggestions.filter((s) => s.confidence >= minConfidence);
  }, [currentData, allClientes, enabled, minConfidence]);

  useEffect(() => {
    setSuggestions(generateSuggestions);
  }, [generateSuggestions]);

  return {
    suggestions,
    isLoading,
    applySuggestion: (suggestion: SmartSuggestion) => {
      return suggestion.value;
    },
  };
}

// Função auxiliar para encontrar valor mais comum
function getMostCommon<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;

  const frequency: Record<string, number> = {};
  arr.forEach((item) => {
    const key = String(item);
    frequency[key] = (frequency[key] || 0) + 1;
  });

  let maxCount = 0;
  let mostCommon: T | null = null;

  Object.entries(frequency).forEach(([key, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = key as T;
    }
  });

  return mostCommon;
}




