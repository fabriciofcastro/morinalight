import type { Column } from 'exceljs';

export interface ExcelSheetConfig {
    name: string;
    columns: Partial<Column>[];
    data: any[];
}

export async function generateExcelReport(
    filename: string,
    sheets: ExcelSheetConfig[]
) {
    const { default: ExcelJS } = await import('exceljs');
    const { saveAs } = await import('file-saver');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MorinaLight Command Center';
    workbook.created = new Date();

    for (const sheetConfig of sheets) {
        const sheet = workbook.addWorksheet(sheetConfig.name);

        sheet.columns = sheetConfig.columns.map(col => ({
            ...col,
            width: col.width || 20 // default width
        }));

        // Add Header Row styling
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' } // blue-600
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add Data
        sheet.addRows(sheetConfig.data);

        // Styling data rows (zebra striping)
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                if (rowNumber % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8FAFC' } // slate-50
                    };
                }
                row.getCell(1).alignment = { horizontal: 'left' }; // First column align left
            }
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(blob, `${filename}.xlsx`);
}
