
import { FastifyInstance } from 'fastify';
import { prisma } from '../../../infra/prisma/client';
import { SnapshotService } from '../snapshot.service';
import { logCompanySettingsChange } from '../audit-logger';

export async function registerSnapshotRoutes(app: FastifyInstance) {
    const snapshotService = new SnapshotService(prisma);

    // Get Versions
    app.get('/company-settings/snapshots', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'x-org-id required' });

        const versions = await snapshotService.getVersions(orgId);
        return versions;
    });

    // Create Snapshot
    app.post('/company-settings/snapshots', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        const actorId = request.headers['x-user-id'] as string;
        if (!orgId || !actorId) return reply.status(400).send({ error: 'x-org-id and x-user-id required' });

        const body = request.body as { name?: string };
        const snapshot = await snapshotService.createSnapshot(orgId, actorId, body.name);
        return snapshot;
    });

    // Restore Snapshot
    app.post('/company-settings/snapshots/:id/restore', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        const actorId = request.headers['x-user-id'] as string;
        const { id } = request.params as { id: string };

        if (!orgId || !actorId) return reply.status(400).send({ error: 'x-org-id and x-user-id required' });

        const restored = await snapshotService.restoreSnapshot(orgId, id, actorId);

        // Explicit Audit Log for Restore
        await logCompanySettingsChange(prisma, {
            orgId,
            actorId,
            action: 'restore',
            entity: 'company_settings',
            oldValue: null,
            newValue: null, // Full restore is hard to diff against specific fields in this simple log call without fetching prev again
            justification: `Restaurado para versão ${id}`,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent']
        });

        return restored;
    });
}
