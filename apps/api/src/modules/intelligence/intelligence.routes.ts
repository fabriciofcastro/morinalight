
import { FastifyInstance } from 'fastify';
import { documentExtractionService } from './document-extraction.service';

export async function intelligenceRoutes(app: FastifyInstance) {
    app.post('/intelligence/extract-company-data', async (request, reply) => {
        // multipart file handling logic
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }

        try {
            const buffer = await data.toBuffer();
            const text = await documentExtractionService.extractFromImage(buffer);
            const extractedData = documentExtractionService.parseCompanyData(text);

            return {
                rawText: text,
                extracted: extractedData
            };
        } catch (e: any) {
            request.log.error(e);
            return reply.status(500).send({ error: 'Failed to process document' });
        }
    });

    app.post('/intelligence/chat', async (request, reply) => {
        const { aiGatewayService } = await import('./ai-gateway.service');
        const body = request.body as { agentSlug: string; message: string; context?: any };
        const userId = request.headers['x-user-id'] as string; // Assuming auth middleware adds this or we just take it from headers for internal api

        try {
            const response = await aiGatewayService.generateResponse({
                agentSlug: body.agentSlug || 'general_assistant',
                message: body.message,
                context: body.context,
                userId
            });

            return response;
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({ error: error.message || 'Failed to generate response' });
        }
    });
}
