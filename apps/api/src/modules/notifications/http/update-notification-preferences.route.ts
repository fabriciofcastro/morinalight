import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";

const updatePreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      category: z.string().min(1).max(100),
      enabled: z.boolean().optional(),
      channels: z.array(z.enum(["email", "push", "inApp"])).optional(),
      frequency: z.enum(["immediate", "daily", "weekly"]).optional(),
      quietHoursStart: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional()
        .nullable(),
      quietHoursEnd: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional()
        .nullable(),
      quietHoursEnabled: z.boolean().optional(),
    }),
  ),
});

const prisma = getPrisma();

export async function registerUpdateNotificationPreferencesRoute(app: FastifyInstance) {
  app.put("/notifications/preferences", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const orgId = (request.headers["x-org-id"] as string) || request.auth.defaultOrgId;
    if (!orgId) {
      return reply.status(400).send({
        message: "x-org-id é obrigatório",
        code: "ORG_ID_REQUIRED",
      });
    }

    const body = updatePreferencesSchema.parse(request.body ?? {});

    const results = await Promise.all(
      body.preferences.map(async (pref) => {
        return await prisma.notificationPreference.upsert({
          where: {
            orgId_userId_category: {
              orgId,
              userId: request.auth?.userId ?? "",
              category: pref.category,
            },
          },
          update: {
            enabled: pref.enabled,
            channels: pref.channels,
            frequency: pref.frequency,
            quietHoursStart: pref.quietHoursStart,
            quietHoursEnd: pref.quietHoursEnd,
            quietHoursEnabled: pref.quietHoursEnabled,
          },
          create: {
            orgId,
            userId: request.auth?.userId ?? "",
            category: pref.category,
            enabled: pref.enabled ?? true,
            channels: pref.channels ?? ["inApp"],
            frequency: pref.frequency ?? "immediate",
            quietHoursStart: pref.quietHoursStart,
            quietHoursEnd: pref.quietHoursEnd,
            quietHoursEnabled: pref.quietHoursEnabled ?? false,
          },
        });
      }),
    );

    return reply.send({ preferences: results });
  });
}











