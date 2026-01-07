import * as XLSX from "xlsx";

export interface ExportColumn {
    header: string;
    accessor: string | ((row: any) => any);
}

/**
 * Export table data to CSV format
 */
export function exportToCSV<TData>(
    data: TData[],
    columns: ExportColumn[],
    filename: string = "export.csv"
) {
    // Create worksheet data
    const wsData = [
        columns.map((col) => col.header),
        ...data.map((row) =>
            columns.map((col) => {
                const value =
                    typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row as any)[col.accessor];
                return value ?? "";
            })
        ),
    ];

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Export
    XLSX.writeFile(wb, filename);
}

/**
 * Export table data to XLSX format
 */
export function exportToXLSX<TData>(
    data: TData[],
    columns: ExportColumn[],
    filename: string = "export.xlsx"
) {
    // Create worksheet data
    const wsData = [
        columns.map((col) => col.header),
        ...data.map((row) =>
            columns.map((col) => {
                const value =
                    typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row as any)[col.accessor];
                return value ?? "";
            })
        ),
    ];

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Auto-size columns
    const maxWidth = wsData.reduce((acc, row) => {
        row.forEach((cell, i) => {
            const cellLength = String(cell).length;
            acc[i] = Math.max(acc[i] || 10, cellLength + 2);
        });
        return acc;
    }, [] as number[]);

    ws["!cols"] = maxWidth.map((w) => ({ wch: Math.min(w, 50) }));

    // Export
    XLSX.writeFile(wb, filename);
}
