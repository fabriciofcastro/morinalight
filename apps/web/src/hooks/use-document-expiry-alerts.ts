/**
 * Hook para gerenciar alertas de documentos vencidos/expirados
 */

import { useMemo } from "react";

export type DocumentExpiryStatus = "valid" | "expiring_soon" | "expired" | "no_date";

export interface DocumentExpiryAlert {
  clienteId: string;
  clienteNome: string;
  documento: string;
  tipoDocumento: "CPF" | "CNPJ";
  validade: Date | null;
  status: DocumentExpiryStatus;
  diasRestantes: number | null;
  diasAteExpiracao: number | null;
}

interface UseDocumentExpiryAlertsOptions {
  diasAviso?: number; // Dias antes da expiração para avisar (padrão: 30)
}

export function useDocumentExpiryAlerts(
  clientes: Array<{
    clienteId: string;
    nome: string;
    documento: string;
    tipo: "fisica" | "juridica";
    documentoValidade?: string | Date | null;
  }>,
  options: UseDocumentExpiryAlertsOptions = {}
) {
  const { diasAviso = 30 } = options;

  const alerts = useMemo(() => {
    const now = new Date();
    const alertsList: DocumentExpiryAlert[] = [];

    clientes.forEach((cliente) => {
      if (!cliente.documentoValidade) {
        return; // Sem data de validade, não gera alerta
      }

      const validade = cliente.documentoValidade instanceof Date
        ? cliente.documentoValidade
        : new Date(cliente.documentoValidade);

      if (isNaN(validade.getTime())) {
        return; // Data inválida
      }

      const diffTime = validade.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: DocumentExpiryStatus;
      if (diffDays < 0) {
        status = "expired";
      } else if (diffDays <= diasAviso) {
        status = "expiring_soon";
      } else {
        status = "valid";
      }

      alertsList.push({
        clienteId: cliente.clienteId,
        clienteNome: cliente.nome,
        documento: cliente.documento,
        tipoDocumento: cliente.tipo === "fisica" ? "CPF" : "CNPJ",
        validade,
        status,
        diasRestantes: diffDays > 0 ? diffDays : null,
        diasAteExpiracao: diffDays < 0 ? Math.abs(diffDays) : null,
      });
    });

    return alertsList.sort((a, b) => {
      // Ordenar: expirados primeiro, depois expirando em breve, depois válidos
      if (a.status === "expired" && b.status !== "expired") return -1;
      if (a.status !== "expired" && b.status === "expired") return 1;
      if (a.status === "expiring_soon" && b.status === "valid") return -1;
      if (a.status === "valid" && b.status === "expiring_soon") return 1;
      
      // Se mesmo status, ordenar por dias restantes
      if (a.diasRestantes !== null && b.diasRestantes !== null) {
        return a.diasRestantes - b.diasRestantes;
      }
      return 0;
    });
  }, [clientes, diasAviso]);

  const expiredCount = useMemo(
    () => alerts.filter((a) => a.status === "expired").length,
    [alerts]
  );

  const expiringSoonCount = useMemo(
    () => alerts.filter((a) => a.status === "expiring_soon").length,
    [alerts]
  );

  const hasAlerts = expiredCount > 0 || expiringSoonCount > 0;

  return {
    alerts,
    expiredCount,
    expiringSoonCount,
    hasAlerts,
    totalAlerts: alerts.length,
  };
}


