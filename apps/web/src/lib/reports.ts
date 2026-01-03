import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Branch } from "@/lib/api/organizational-structure";

interface ReportOptions {
    title: string;
    subtitle?: string;
    data: any[];
    columns: { header: string; key: string }[];
    stats?: { label: string; value: string | number }[];
}

export const generatePDFReport = ({ title, subtitle, data, columns, stats }: ReportOptions) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, 20);

    if (subtitle) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, 14, 28);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 35);

    let currentY = 45;

    // Stats Section
    if (stats && stats.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Resumo Executivo", 14, currentY);

        currentY += 10;

        const statWidth = (pageWidth - 28) / 3; // 3 stats per row max

        stats.forEach((stat, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);

            if (col === 0 && index !== 0) {
                currentY += 20;
            }

            const x = 14 + (col * statWidth);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(stat.label.toUpperCase(), x, currentY);

            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(String(stat.value), x, currentY + 7);
        });

        currentY += 25;
    }

    // Data Table
    const tableData = data.map(item => columns.map(col => item[col.key]));

    // @ts-ignore
    autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: tableData,
        startY: currentY,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] }, // Blue primary
        styles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyyMMdd")}.pdf`);
};

export const generateExcelReport = ({ title, data }: Pick<ReportOptions, "title" | "data">) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "Dados");

    XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyyMMdd")}.xlsx`);
};

// Helper específico para Filiais
export const exportBranchesReport = (branches: Branch[], format: "pdf" | "excel") => {
    const stats = [
        { label: "Total de Filiais", value: branches.length },
        { label: "Ativas", value: branches.filter(b => b.active).length },
        { label: "Inativas", value: branches.filter(b => !b.active).length },
    ];

    const exportData = branches.map(b => ({
        Nome: b.name,
        Código: b.code,
        Tipo: b.type,
        Status: b.active ? "Ativa" : "Inativa",
        Cidade: b.address?.city || "-",
        Estado: b.address?.state || "-",
        Email: b.email || "-",
        Telefone: b.phone || "-"
    }));

    if (format === "pdf") {
        generatePDFReport({
            title: "Relatório de Filiais",
            subtitle: "Listagem detalhada e indicadores de performance",
            data: exportData,
            columns: [
                { header: "NOME", key: "Nome" },
                { header: "CÓDIGO", key: "Código" },
                { header: "TIPO", key: "Tipo" },
                { header: "STATUS", key: "Status" },
                { header: "CIDADE/UF", key: "Cidade" }, // Simplificação para caber
            ],
            stats
        });
    } else {
        generateExcelReport({
            title: "Relatório de Filiais",
            data: exportData
        });
    }
};
