
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDFReport(
    elementId: string,
    filename: string,
    title?: string
) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return;
    }

    try {
        // Show loading state or modify element if needed (optional)
        // We capture the element as canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Improve quality
            useCORS: true,
            logging: false,
            backgroundColor: '#0f172a' // Match app background color (approx)
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Header
        if (title) {
            pdf.setFontSize(18);
            pdf.setTextColor(40, 40, 40);
            pdf.text(title, 10, 10);
            pdf.setFontSize(10);
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 10, 16);
        }

        // Add Image
        // If title exists, offset y by 20mm
        const yOffset = title ? 20 : 0;

        // Check if image height exceeds page height
        const pageHeight = pdf.internal.pageSize.getHeight();

        if (pdfHeight + yOffset > pageHeight) {
            // Primitive multi-page splitting if needed, but for dashboard screenshot usually fit to page is better
            // or we just let it be (it might crop).
            // For now, let's scale it to fit if it's too tall
            const ratio = (pageHeight - yOffset - 10) / pdfHeight;
            if (ratio < 1) {
                // Scale down
                pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth * ratio, pdfHeight * ratio);
            } else {
                pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
            }
        } else {
            pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
        }

        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
