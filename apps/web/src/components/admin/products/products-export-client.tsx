"use client";

import { Button } from "@morina/ui";
import { Download, ArrowLeft, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { notificationCenter } from "@/shared/ui/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/api/base";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { PageHeader } from "@/shared/ui/base/page-header";

export function ProductsExportClient() {
    const router = useRouter();
    const [format, setFormat] = useState<"csv" | "excel" | "json">("csv");
    const [loading, setLoading] = useState(false);

    const handleExport = useCallback(async () => {
        setLoading(true);
        try {
            const headers = getAuthHeadersWithTenant();
            const response = await fetch(`/api/products/export?format=${format}`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erro ao exportar produtos" }));
                throw new Error(errorData.message || "Não foi possível exportar os produtos.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `produtos-export-${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notificationCenter.add({
                type: "success",
                title: "Exportação Concluída",
                message: "Os produtos foram exportados com sucesso!",
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao exportar produtos.";
            notificationCenter.add({
                type: "error",
                title: "Erro ao Exportar",
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [format]);

    return (
        <AllowedGuard I="read" a="Product" redirectTo="/admin/products/list">
            <div className="relative min-h-screen p-6 space-y-8">
                {/* Modern Header */}
                <PageHeader
                    title="Exportar Produtos"
                    subtitle="Exporte seu catálogo de produtos em diferentes formatos"
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

                {/* Export Options */}
                <div className="p-8 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Opções de Exportação
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-white/70 mb-3">Formato do Arquivo</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormat("csv")}
                                    className={`p-4 rounded-lg border transition-all ${format === "csv"
                                        ? "border-blue-500/50 bg-blue-500/20"
                                        : "border-white/20 bg-white/[0.03] hover:border-white/30"
                                        }`}
                                >
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-white/60" />
                                    <p className="text-sm font-medium text-white/90">CSV</p>
                                    <p className="text-xs text-white/50 mt-1">Comma Separated Values</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormat("excel")}
                                    className={`p-4 rounded-lg border transition-all ${format === "excel"
                                        ? "border-blue-500/50 bg-blue-500/20"
                                        : "border-white/20 bg-white/[0.03] hover:border-white/30"
                                        }`}
                                >
                                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-white/60" />
                                    <p className="text-sm font-medium text-white/90">Excel</p>
                                    <p className="text-xs text-white/50 mt-1">Microsoft Excel (.xlsx)</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormat("json")}
                                    className={`p-4 rounded-lg border transition-all ${format === "json"
                                        ? "border-blue-500/50 bg-blue-500/20"
                                        : "border-white/20 bg-white/[0.03] hover:border-white/30"
                                        }`}
                                >
                                    <FileDown className="h-8 w-8 mx-auto mb-2 text-white/60" />
                                    <p className="text-sm font-medium text-white/90">JSON</p>
                                    <p className="text-xs text-white/50 mt-1">JavaScript Object Notation</p>
                                </button>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] cursor-pointer h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleExport}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar Produtos
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AllowedGuard>
    );
}
