"use client";

import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@morina/ui";
import type { ImportResult } from "@/lib/api/suppliers-import";

interface ResultStepProps {
  result: ImportResult;
  onReset: () => void;
  onBack: () => void;
}

export function ResultStep({ result, onReset, onBack }: ResultStepProps) {
  const successRate = result.success + result.failed > 0
    ? Math.round((result.success / (result.success + result.failed)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Resultado da Importação</h2>
        <p className="text-white/70">Importação concluída. Veja os resultados abaixo.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/20 bg-white/5 p-6 text-center">
          <p className="mb-2 text-sm text-white/70">Taxa de Sucesso</p>
          <p className="text-4xl font-bold text-white">{successRate}%</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
          <p className="mb-2 text-sm text-white/70">Importados</p>
          <p className="text-4xl font-bold text-green-400">{result.success}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <XCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
          <p className="mb-2 text-sm text-white/70">Falharam</p>
          <p className="text-4xl font-bold text-red-400">{result.failed}</p>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-red-400">
            <XCircle className="h-5 w-5" />
            Erros na Importação
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {result.errors.map((error, index) => (
              <div key={index} className="rounded border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-sm font-medium text-red-300">Linha {error.row}</p>
                <p className="text-xs text-red-200/80">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {result.success > 0 && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <div>
              <p className="font-medium text-green-400">
                {result.success} fornecedor(es) importado(s) com sucesso!
              </p>
              <p className="text-sm text-green-300/80">
                Você pode visualizá-los na lista de fornecedores.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Nova Importação
        </Button>
        <Button onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Fornecedores
        </Button>
      </div>
    </div>
  );
}

