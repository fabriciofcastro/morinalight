/**
 * Chart Export Utilities
 * Provides functions to export charts as PNG, SVG, and CSV
 */

/**
 * Export chart data to CSV format
 */
export function exportDataToCSV(data: any[], filename: string = "chart-data.csv") {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Get all unique keys from the data
    const keys = Array.from(
        new Set(data.flatMap((item) => Object.keys(item)))
    );

    // Create CSV header
    const header = keys.join(",");

    // Create CSV rows
    const rows = data.map((item) =>
        keys.map((key) => {
            const value = item[key];
            // Handle values that might contain commas
            if (typeof value === "string" && value.includes(",")) {
                return `"${value}"`;
            }
            return value ?? "";
        }).join(",")
    );

    // Combine header and rows
    const csv = [header, ...rows].join("\n");

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadFile(blob, filename);
}

/**
 * Export chart as PNG using html2canvas
 * Note: Requires html2canvas library to be installed
 */
export async function exportChartToPNG(
    elementId: string,
    filename: string = "chart.png"
) {
    try {
        // Dynamically import html2canvas to avoid SSR issues
        const html2canvas = (await import("html2canvas")).default;

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id "${elementId}" not found`);
            return;
        }

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            backgroundColor: "#0f172a", // Match dashboard background
            scale: 2, // Higher quality
            logging: false,
        });

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                downloadFile(blob, filename);
            }
        }, "image/png");
    } catch (error) {
        console.error("Error exporting chart to PNG:", error);
    }
}

/**
 * Export chart as SVG
 * Note: This is a simplified version that works with Recharts
 */
export function exportChartToSVG(
    elementId: string,
    filename: string = "chart.svg"
) {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id "${elementId}" not found`);
            return;
        }

        // Find the SVG element within the chart
        const svgElement = element.querySelector("svg");
        if (!svgElement) {
            console.error("No SVG element found in chart");
            return;
        }

        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Add XML namespace if not present
        if (!clonedSvg.getAttribute("xmlns")) {
            clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        }

        // Serialize the SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clonedSvg);

        // Create blob and download
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        downloadFile(blob, filename);
    } catch (error) {
        console.error("Error exporting chart to SVG:", error);
    }
}

/**
 * Helper function to trigger file download
 */
function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get filename with timestamp
 */
export function getTimestampedFilename(
    baseName: string,
    extension: string
): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    return `${baseName}_${timestamp}.${extension}`;
}
