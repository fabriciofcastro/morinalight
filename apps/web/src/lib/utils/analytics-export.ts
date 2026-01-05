/**
 * Analytics Data Export Utility
 * Provides functions to export analytics data in various formats
 */

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
    filename?: string;
    format: ExportFormat;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV header row
    const csvHeaders = headers.join(',');

    // Create CSV data rows
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download data as file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export analytics data to CSV or JSON
 */
export function exportAnalyticsData(data: any[], options: ExportOptions) {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `analytics-export-${timestamp}`;
    const filename = options.filename || defaultFilename;

    if (options.format === 'csv') {
        const csv = arrayToCSV(data);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else if (options.format === 'json') {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `${filename}.json`, 'application/json');
    }
}

/**
 * Export sales data
 */
export function exportSalesData(salesData: any[], format: ExportFormat = 'csv') {
    exportAnalyticsData(salesData, {
        filename: `sales-data-${new Date().toISOString().split('T')[0]}`,
        format
    });
}

/**
 * Export KPIs
 */
export function exportKPIs(kpis: any, format: ExportFormat = 'csv') {
    // Convert single object to array for CSV export
    const data = [kpis];
    exportAnalyticsData(data, {
        filename: `kpis-${new Date().toISOString().split('T')[0]}`,
        format
    });
}

/**
 * Export supplier performance
 */
export function exportSupplierPerformance(suppliers: any[], format: ExportFormat = 'csv') {
    exportAnalyticsData(suppliers, {
        filename: `supplier-performance-${new Date().toISOString().split('T')[0]}`,
        format
    });
}

/**
 * Export inventory insights
 */
export function exportInventoryInsights(inventory: any[], format: ExportFormat = 'csv') {
    exportAnalyticsData(inventory, {
        filename: `inventory-insights-${new Date().toISOString().split('T')[0]}`,
        format
    });
}

/**
 * Export customer segments
 */
export function exportCustomerSegments(segments: any[], format: ExportFormat = 'csv') {
    exportAnalyticsData(segments, {
        filename: `customer-segments-${new Date().toISOString().split('T')[0]}`,
        format
    });
}

/**
 * Export top products
 */
export function exportTopProducts(products: any[], format: ExportFormat = 'csv') {
    exportAnalyticsData(products, {
        filename: `top-products-${new Date().toISOString().split('T')[0]}`,
        format
    });
}

/**
 * Export recent activity
 */
export function exportRecentActivity(activity: any[], format: ExportFormat = 'csv') {
    exportAnalyticsData(activity, {
        filename: `recent-activity-${new Date().toISOString().split('T')[0]}`,
        format
    });
}
