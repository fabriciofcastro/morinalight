
import { createWorker } from 'tesseract.js';

export class DocumentExtractionService {
    async extractFromImage(buffer: Buffer): Promise<string> {
        const worker = await createWorker('por');

        try {
            const ret = await worker.recognize(buffer);
            await worker.terminate();
            return ret.data.text;
        } catch (error) {
            await worker.terminate();
            console.error('Error in Tesseract extraction:', error);
            throw new Error('Failed to extract text from document');
        }
    }

    parseCompanyData(text: string): Record<string, any> {
        const extracted: Record<string, any> = {};

        // Normalize text for easier regex matching
        const cleanText = text.replace(/\s+/g, ' ');

        // CNPJ Extraction (XX.XXX.XXX/XXXX-XX or just numbers)
        const cnpjRegex = /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})|(\d{14})/;
        const cnpjMatch = cleanText.match(cnpjRegex);
        if (cnpjMatch) {
            extracted.cnpj = cnpjMatch[0];
        }

        // Razão Social Heuristics (Look for LTDA, S.A., EIRELI)
        // This is naive but works for a POC
        const nameRegex = /([A-Z\s\.]+(LTDA|EIRELI|S\.A\.|ME|EPP))/i;
        const nameMatch = cleanText.match(nameRegex);
        if (nameMatch) {
            extracted.legalName = nameMatch[0].trim();
        }

        // Address (Look for CEP logic or generic address keywords)
        // CEP usually is XXXXX-XXX
        const cepRegex = /\d{5}-\d{3}/;
        const cepMatch = cleanText.match(cepRegex);
        if (cepMatch) {
            // Extracted zip code, could use it to fetch address via external API if needed
            // For now just return it
            if (!extracted.address) extracted.address = {};
            extracted.address.zipCode = cepMatch[0];
        }

        return extracted;
    }
}

export const documentExtractionService = new DocumentExtractionService();
