"use client";

import { AllowedGuard } from "@/components/auth/allowed-guard";
import { notificationCenter } from "@/shared/ui/notification-center";
import { PageHeader } from "@/shared/ui/base/page-header";
import { getAuthHeadersWithTenant } from "@/lib/api/base";
import { Button } from "@morina/ui";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, FileText, Upload, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function ProductsImportClient() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: number;
        errors: number;
        details?: Array<{ line: number; error: string }>;
    } | null>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
                setFile(selectedFile);
                setImportResult(null);
            } else {
                notificationCenter.add({
                    type: "error",
                    title: "Arquivo Inválido",
                    message: "Por favor, selecione um arquivo CSV",
                });
            }
        }
    }, []);

    const handleImport = useCallback(async () => {
        if (!file) {
            notificationCenter.add({
                type: "error",
                title: "Arquivo Necessário",
                message: "Por favor, selecione um arquivo CSV para importar",
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const headers = getAuthHeadersWithTenant();
            delete headers["Content-Type"];

            const response = await fetch("/api/products/import", {
                method: "POST",
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erro ao importar produtos" }));
                throw new Error(errorData.message || "Não foi possível importar os produtos.");
            }

            const result = (await response.json()) as Exclude<typeof importResult, null>;
            setImportResult(result);

            notificationCenter.add({
                type: result.errors === 0 ? "success" : "warning",
                title: "Importação Concluída",
                message: `${result.success} produto(s) importado(s) com sucesso${result.errors > 0 ? `. ${result.errors} erro(s) encontrado(s).` : "."}`,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao importar produtos.";
            notificationCenter.add({
                type: "error",
                title: "Erro ao Importar",
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [file]);

    const downloadTemplate = useCallback(() => {
        const csvContent = "SKU,Nome,Descrição,Preço Custo,Preço Venda,Unidade,Status\nPROD-001,Lâmpada LED 9W,Lâmpada de alta eficiência,10.50,25.90,UN,ACTIVE";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "template-importacao-produtos.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    return (
        <AllowedGuard I={"create" as any} a="Product" redirectTo="/admin/products/list">
            <div className="relative min-h-screen p-6 space-y-8">
                {/* Modern Header */}
                <PageHeader
                    title="Importar Produtos"
                    subtitle="Importe múltiplos produtos através de arquivo CSV"
                    actions={
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin/products/list")}
                            className="border-white/10 hover:bg-white/5 text-white gap-2 cursor-pointer h-[40px]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar para Lista</span>
                        </Button>
                    }
                />

                {/* Instructions */}
                <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Instruções
                    </h2>
                    <ol className="space-y-2 text-sm text-white/70 list-decimal list-inside">
                        <li>Baixe o template CSV clicando no botão abaixo</li>
                        <li>Preencha o arquivo com os dados dos produtos</li>
                        <li>Certifique-se de que os dados estão corretos e completos</li>
                        <li>Faça upload do arquivo preenchido</li>
                    </ol>
                    <div className="mt-4">
                        <Button
                            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
                            onClick={downloadTemplate}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Template CSV
                        </Button>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="p-8 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload do Arquivo
                    </h2>
                    <div className="space-y-4">
                        <div className="relative border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-blue-500/50 transition-all">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="file-upload"
                            />
                            <FileSpreadsheet className="h-12 w-12 mx-auto text-white/40 mb-4" />
                            <p className="text-white/80 mb-2">
                                {file ? file.name : "Clique para selecionar ou arraste um arquivo CSV"}
                            </p>
                            <p className="text-xs text-white/50">Apenas arquivos CSV são aceitos</p>
                        </div>
                        {file && (
                            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/[0.03]">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-white/90">{file.name}</p>
                                        <p className="text-xs text-white/50">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <Button
                                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[32px] px-3"
                                    onClick={() => setFile(null)}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] cursor-pointer h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleImport}
                            disabled={!file || loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Importar Produtos
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Import Results */}
                {importResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
                    >
                        <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                            {importResult.errors === 0 ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                                <XCircle className="h-5 w-5 text-yellow-400" />
                            )}
                            Resultado da Importação
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                <span className="text-sm text-white/80">
                                    {importResult.success} produto(s) importado(s) com sucesso
                                </span>
                            </div>
                            {importResult.errors > 0 && (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-white/80">
                                        {importResult.errors} erro(s) encontrado(s)
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </AllowedGuard>
    );
}
