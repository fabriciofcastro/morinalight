
import { randomBytes, createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../lib/errors'; // Assuming AppError exists or use generic Error

const prisma = new PrismaClient();

export class ApiKeyService {
    /**
     * Generates a secure API key, hashes it for storage, and returns the raw key to the user (once).
     * Format: sk_live_<24_hex_chars>
     */
    async createApiKey(orgId: string, name: string, scopes: string[] = []) {
        const rawBytes = randomBytes(24).toString('hex');
        const rawKey = `sk_live_${rawBytes}`;

        // Hash for storage
        const hashedKey = createHash('sha256').update(rawKey).digest('hex');

        const apiKey = await prisma.apiKey.create({
            data: {
                orgId,
                name,
                key: hashedKey,
                prefix: 'sk_live_',
                scopes: scopes,
                isActive: true,
            },
        });

        // Return rawKey ONLY here. It can never be retrieved again.
        return { ...apiKey, rawKey };
    }

    async listKeys(orgId: string) {
        return prisma.apiKey.findMany({
            where: { orgId, isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                prefix: true,
                lastUsedAt: true,
                createdAt: true,
                scopes: true,
            }
        });
    }

    async revokeKey(orgId: string, keyId: string) {
        const key = await prisma.apiKey.findFirst({
            where: { id: keyId, orgId },
        });

        if (!key) {
            throw new Error('API Key not found or access denied.');
        }

        // Hard delete or Soft delete? Schema says nothing, let's delete or set active=false
        // The schema has isActive, so better set false usually, but user might want to delete.
        // Let's delete for now as per "Revoke" often implying removal or permanent deactivation.
        // If we want to keep history, updates isActive = false.
        // schema: isActive Boolean @default(true)

        return prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false }
        });
    }

    /**
     * Validates a raw API key.
     * Returns the organization ID if valid, or null.
     */
    async validateApiKey(rawKey: string): Promise<{ orgId: string, scopes: any } | null> {
        if (!rawKey.startsWith('sk_live_')) return null;

        const hashedKey = createHash('sha256').update(rawKey).digest('hex');

        const apiKey = await prisma.apiKey.findUnique({
            where: { key: hashedKey },
        });

        if (!apiKey || !apiKey.isActive) return null;

        // Update lastUsedAt async (fire and forget)
        // In strict transactional systems this might lock, but for simple MVP it's fine.
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() }
        });

        return { orgId: apiKey.orgId, scopes: apiKey.scopes };
    }
}

export const apiKeyService = new ApiKeyService();
