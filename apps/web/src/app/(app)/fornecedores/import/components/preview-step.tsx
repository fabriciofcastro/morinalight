"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Download } from "lucide-react";
import { Button } from "@morina/ui";
import type { ImportPreview } from "@/lib/api/suppliers-import";

interface PreviewStepProps {
  preview: ImportPreview;
  onImport: () => void;
  onBack: () => void;
  loading: boolean;
}

export function PreviewStep({ preview, onImport, onBack, loading }: PreviewStepProps) {
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const filteredRows = useMemo(() => {
    if (filter === "valid") {
      return preview.rows.filter((r) => r.validation.isValid);
    }
    if (filter === "invalid") {
      return preview.rows.filter((r) => !r.validation.isValid);
    }
    return preview.rows;
  }, [preview.rows, filter]);

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Preview e Validação</h2>
        <p className="text-white/70">
          Revise os dados antes de importar. {preview.validRows} de {preview.totalRows} fornecedores estão válidos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/20 bg-white/5 p-4">
          <p className="text-sm text-white/70">Total</p>
          <p className="text-2xl font-bold text-white">{preview.totalRows}</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-white/70">Válidos</p>
          <p className="text-2xl font-bold text-green-400">{preview.validRows}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-white/70">Inválidos</p>
          <p className="text-2xl font-bold text-red-400">{preview.invalidRows}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos ({preview.totalRows})
        </Button>
        <Button
          variant={filter === "valid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("valid")}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Válidos ({preview.validRows})
        </Button>
        <Button
          variant={filter === "invalid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("invalid")}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Inválidos ({preview.invalidRows})
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/20 bg-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">CNPJ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.index}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3 text-sm text-white/70">{row.index}</td>
                <td className="px-4 py-3 text-sm text-white">{row.data.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-white/70">{row.data.document || "-"}</td>
                <td className="px-4 py-3 text-sm text-white/70">{row.data.email || "-"}</td>
                <td className="px-4 py-3">
                  {row.validation.isValid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Válido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-400">
                      <XCircle className="h-3 w-3" />
                      Inválido
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRow(row.index)}
                  >
                    {expandedRows.has(row.index) ? "Ocultar" : "Detalhes"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Row Details */}
      {Array.from(expandedRows).map((index) => {
        const row = preview.rows.find((r) => r.index === index);
        if (!row) return null;

        return (
          <div
            key={index}
            className="rounded-lg border border-white/20 bg-white/5 p-4"
          >
            <h3 className="mb-3 font-medium text-white">Detalhes da Linha {index}</h3>
            <div className="mb-4 grid grid-cols-2 gap-4">
              {Object.entries(row.data).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-white/50">{key}</p>
                  <p className="text-sm text-white">{value || "-"}</p>
                </div>
              ))}
            </div>
            {row.validation.errors.length > 0 && (
              <div className="mb-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-400">
                  <XCircle className="h-4 w-4" />
                  Erros:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-red-300">
                  {row.validation.errors.map((error, i) => (
                    <li key={i}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {row.validation.warnings.length > 0 && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  Avisos:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-yellow-300">
                  {row.validation.warnings.map((warning, i) => (
                    <li key={i}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onImport} disabled={loading || preview.validRows === 0} size="lg">
          {loading ? "Importando..." : `Importar ${preview.validRows} Fornecedor(es)`}
        </Button>
      </div>
    </div>
  );
}

