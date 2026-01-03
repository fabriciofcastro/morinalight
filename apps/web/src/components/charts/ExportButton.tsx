"use client";

import { useState } from "react";
import { Download, ChevronDown, FileImage, FileCode, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    exportChartToPNG,
    exportChartToSVG,
    exportDataToCSV,
    getTimestampedFilename,
} from "@/lib/utils/chart-export";

interface ExportButtonProps {
    chartId: string;
    chartData?: any[];
    chartName?: string;
}

export function ExportButton({ chartId, chartData, chartName = "chart" }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPNG = async () => {
        setIsExporting(true);
        const filename = getTimestampedFilename(chartName, "png");
        await exportChartToPNG(chartId, filename);
        setIsExporting(false);
        setIsOpen(false);
    };

    const handleExportSVG = () => {
        setIsExporting(true);
        const filename = getTimestampedFilename(chartName, "svg");
        exportChartToSVG(chartId, filename);
        setIsExporting(false);
        setIsOpen(false);
    };

    const handleExportCSV = () => {
        if (!chartData || chartData.length === 0) {
            alert("Nenhum dado disponível para exportar");
            return;
        }
        setIsExporting(true);
        const filename = getTimestampedFilename(chartName, "csv");
        exportDataToCSV(chartData, filename);
        setIsExporting(false);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
                title="Exportar gráfico"
            >
                <Download className="h-3.5 w-3.5 text-white/50" />
                <ChevronDown
                    className={`h-3.5 w-3.5 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-lg"
                        >
                            <div className="p-1">
                                <button
                                    onClick={handleExportPNG}
                                    disabled={isExporting}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    <FileImage className="h-4 w-4" />
                                    <span>Exportar PNG</span>
                                </button>

                                <button
                                    onClick={handleExportSVG}
                                    disabled={isExporting}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    <FileCode className="h-4 w-4" />
                                    <span>Exportar SVG</span>
                                </button>

                                <button
                                    onClick={handleExportCSV}
                                    disabled={isExporting || !chartData}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span>Exportar CSV</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
