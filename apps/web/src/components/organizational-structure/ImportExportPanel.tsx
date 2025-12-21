"use client";

import { Button, GlassCard, Input, Label } from "@morina/ui";
import { Download, Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { downloadFile, exportToCSV, exportToJSON } from "@/lib/organizational-structure/export";
import { importFromJSON, readFileAsText, type ImportResult } from "@/lib/organizational-structure/import";
import { importFromCSV } from "@/lib/organizational-structure/import-csv";
import type { Department, Subdepartment, Sector, Position } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";

type ImportExportPanelProps = {
  departments: Department[];
  subdepartments: Subdepartment[];
  sectors: Sector[];
  positions: Position[];
  orgId: string;
  onImportComplete?: () => void;
};

export function ImportExportPanel({
  departments,
  subdepartments,
  sectors,
  positions,
  orgId,
  onImportComplete,
}: ImportExportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleExportJSON = useCallback(() => {
    try {
      const json = exportToJSON(departments, subdepartments, sectors, positions);
      const filename = `estrutura-organizacional-${new Date().toISOString().split("T")[0]}.json`;
      downloadFile(json, filename, "application/json");
      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: "Estrutura organizacional exportada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: error instanceof Error ? error.message : "Falha ao exportar estrutura organizacional.",
      });
    }
  }, [departments, subdepartments, sectors, positions]);

  const handleExportCSV = useCallback(() => {
    try {
      const csv = exportToCSV(departments, subdepartments, sectors, positions);
      const filename = `estrutura-organizacional-${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(csv, filename, "text/csv");
      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: "Estrutura organizacional exportada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: error instanceof Error ? error.message : "Falha ao exportar estrutura organizacional.",
      });
    }
  }, [departments, subdepartments, sectors, positions]);

  const handleImport = useCallback(
    async (file: File) => {
      if (!file) return;

      setImporting(true);
      setImportResult(null);
      setShowResult(false);

      try {
        const content = await readFileAsText(file);
        const result = await importFromJSON(content, orgId, {
          skipDuplicates: false,
          updateExisting: false,
        });

        setImportResult(result);
        setShowResult(true);

        if (result.success) {
          notificationCenter.add({
            type: "success",
            title: "Importação concluída",
            message: `Importados: ${result.imported.departments} departamentos, ${result.imported.subdepartments} subdepartamentos, ${result.imported.sectors} setores, ${result.imported.positions} cargos.`,
          });
          onImportComplete?.();
        } else {
          notificationCenter.add({
            type: "warning",
            title: "Importação com erros",
            message: `${result.errors.length} erro(s) encontrado(s) durante a importação.`,
          });
        }
      } catch (error) {
        notificationCenter.add({
          type: "error",
          title: "Erro na importação",
          message: error instanceof Error ? error.message : "Falha ao importar estrutura organizacional.",
        });
      } finally {
        setImporting(false);
      }
    },
    [orgId, onImportComplete],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleImport(file);
      }
    },
    [handleImport],
  );

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Importar / Exportar</h3>
          <p className="text-sm text-white/60 mt-1">
            Exporte ou importe a estrutura organizacional completa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exportação */}
        <div className="space-y-3">
          <Label className="text-white/80">Exportar</Label>
          <div className="flex gap-2">
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="flex-1"
              disabled={departments.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex-1"
              disabled={departments.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Importação */}
        <div className="space-y-3">
          <Label className="text-white/80">Importar</Label>
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={importing}
                className="hidden"
                id="import-file-json-input"
              />
              <Label
                htmlFor="import-file-json-input"
                className="flex items-center justify-center gap-2 cursor-pointer border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md transition-colors text-sm"
              >
                <Upload className="h-4 w-4" />
                {importing ? "Importando..." : "JSON"}
              </Label>
            </div>
            <div className="relative">
              <Input
                type="file"
                accept=".csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImporting(true);
                    setImportResult(null);
                    setShowResult(false);
                    try {
                      const content = await readFileAsText(file);
                      const result = await importFromCSV(content, orgId, {
                        skipDuplicates: false,
                        updateExisting: false,
                      });
                      setImportResult(result);
                      setShowResult(true);
                      if (result.success) {
                        notificationCenter.add({
                          type: "success",
                          title: "Importação concluída",
                          message: `Importados: ${result.imported.departments} departamentos, ${result.imported.subdepartments} subdepartamentos, ${result.imported.sectors} setores, ${result.imported.positions} cargos.`,
                        });
                        onImportComplete?.();
                      } else {
                        notificationCenter.add({
                          type: "warning",
                          title: "Importação com erros",
                          message: `${result.errors.length} erro(s) encontrado(s) durante a importação.`,
                        });
                      }
                    } catch (error) {
                      notificationCenter.add({
                        type: "error",
                        title: "Erro na importação",
                        message: error instanceof Error ? error.message : "Falha ao importar estrutura organizacional.",
                      });
                    } finally {
                      setImporting(false);
                    }
                  }
                }}
                disabled={importing}
                className="hidden"
                id="import-file-csv-input"
              />
              <Label
                htmlFor="import-file-csv-input"
                className="flex items-center justify-center gap-2 cursor-pointer border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md transition-colors text-sm"
              >
                <Upload className="h-4 w-4" />
                {importing ? "Importando..." : "CSV"}
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado da importação */}
      {showResult && importResult && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            importResult.success
              ? "bg-green-500/10 border-green-500/30"
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              )}
              <h4 className="font-semibold text-white">
                {importResult.success ? "Importação concluída" : "Importação com erros"}
              </h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResult(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-white/80">
              <strong>Importados:</strong> {importResult.imported.departments} departamentos,{" "}
              {importResult.imported.subdepartments} subdepartamentos, {importResult.imported.sectors} setores,{" "}
              {importResult.imported.positions} cargos
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-3">
                <div className="font-semibold text-white/80 mb-2">Erros ({importResult.errors.length}):</div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, idx) => (
                    <div key={idx} className="text-red-400 text-xs">
                      {error.type} {error.code} ({error.name}): {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.warnings.length > 0 && (
              <div className="mt-3">
                <div className="font-semibold text-white/80 mb-2">Avisos ({importResult.warnings.length}):</div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.warnings.map((warning, idx) => (
                    <div key={idx} className="text-yellow-400 text-xs">
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

