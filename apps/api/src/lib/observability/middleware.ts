import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import * as Sentry from "@sentry/node";

const sentryPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // 1. Request Handler (Tracing e Contexto)
    fastify.addHook("onRequest", async (request, reply) => {
        Sentry.configureScope((scope) => {
            scope.setTag("method", request.method);
            scope.setTag("url", request.url);
        });
    });

    // 2. Error Monitor (Passivo) - Captura erros sem interferir na resposta
    fastify.addHook("onError", async (request, reply, error) => {
        // Ignorar erros 4xx que não são server errors
        if (reply.statusCode && reply.statusCode < 500) {
            return;
        }

        // Ignorar erros de validação conhecidos (Zod)
        if ((error as any).code === "FST_ERR_VALIDATION") {
            return;
        }

        Sentry.withScope((scope) => {
            scope.setSDKProcessingMetadata({ request });

            if (request.headers["user-agent"]) {
                scope.setTag("user_agent", request.headers["user-agent"]);
            }

            // Adicionar contexto de usuário se disponível
            // Assumindo que o request.user é populado por um middleware de auth anterior
            const user = (request as any).user;
            if (user?.id) {
                scope.setUser({ id: user.id, email: user.email });
            }

            Sentry.captureException(error);
        });
    });
};

export default fp(sentryPlugin, {
    name: "sentry-plugin",
});
