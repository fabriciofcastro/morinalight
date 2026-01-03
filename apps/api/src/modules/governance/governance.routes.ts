
import { FastifyInstance } from 'fastify';
import { governanceService } from './governance.service';

export async function governanceRoutes(app: FastifyInstance) {
    // --- Workflows ---

    app.get('/governance/workflows', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'x-org-id header required' });

        const workflows = await governanceService.getWorkflows(orgId);
        return workflows;
    });

    app.post('/governance/workflows', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'x-org-id header required' });

        // TODO: Validate body with Zod
        const body = request.body as { module: string, fields: string[], approverRole: string };

        const workflow = await governanceService.createWorkflow(orgId, body);
        return workflow;
    });


    // --- Evidence ---

    app.get('/governance/evidence', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'x-org-id required' });

        const { EvidenceExportService } = await import('./evidence.service');

        // Default to last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        try {
            const evidence = await EvidenceExportService.exportEvidence(orgId, { startDate, endDate });
            return evidence;
        } catch (e: any) {
            return reply.status(500).send({ error: e.message });
        }
    });

    // --- Requests ---

    app.get('/governance/requests', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'x-org-id header required' });

        const requests = await governanceService.getPendingRequests(orgId);
        return requests;
    });

    app.post('/governance/requests/:id/approve', async (request, reply) => {
        const { id } = request.params as { id: string };
        const approverId = request.headers['x-user-id'] as string; // Assuming auth middleware

        try {
            const result = await governanceService.approveRequest(id, approverId);
            return result;
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    });

    app.post('/governance/requests/:id/reject', async (request, reply) => {
        const { id } = request.params as { id: string };
        const approverId = request.headers['x-user-id'] as string;

        try {
            const result = await governanceService.rejectRequest(id, approverId);
            return result;
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    });

    app.put('/governance/requests/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as any;

        // TODO: Check if requester is the user (middleware/service logic)

        const result = await governanceService.updateRequest(id, body);
        return result;
    });

    app.post('/governance/requests/:id/submit', async (request, reply) => {
        const { id } = request.params as { id: string };
        // Just reusing updateRequest status update logic or specific methods?
        // Let's use prisma update directly inside service or a dedicated method.
        // I'll assume we can use `createRequest`'s logic but for update status.
        // Actually I should allow `updateRequest` to accept status change too?
        // Or specific `submitRequest` method.
        // For simplicity, let's just make a specialized quick inline update or add method.
        // Adding inline for speed:
        const { prisma } = await import('../../infra/prisma/client');

        await prisma.approvalRequest.update({
            where: { id },
            data: { status: 'PENDING' }
        });

        return { success: true };
    });

    // --- Comments ---

    app.get('/governance/requests/:id/comments', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { commentsService } = await import('./comments.service');
        const comments = await commentsService.getComments(id);
        return comments;
    });

    app.post('/governance/requests/:id/comments', async (request, reply) => {
        const { id } = request.params as { id: string };
        const authorId = request.headers['x-user-id'] as string;
        const body = request.body as { content: string };

        if (!authorId) return reply.status(400).send({ error: 'x-user-id required' });
        if (!body.content) return reply.status(400).send({ error: 'Content required' });

        const { commentsService } = await import('./comments.service');
        const comment = await commentsService.createComment(id, authorId, body.content);
        return comment;
    });
}
