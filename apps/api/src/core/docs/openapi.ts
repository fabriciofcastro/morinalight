/**
 * Módulo de Documentação OpenAPI/Swagger
 * Configura documentação automática da API usando @fastify/swagger e @fastify/swagger-ui
 * 
 * A documentação é gerada automaticamente a partir das rotas registradas no Fastify
 * com seus schemas Zod, proporcionando documentação sempre atualizada.
 */

import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { env } from "../config/env";

export type SwaggerOptions = {
  /**
   * Habilitar documentação Swagger
   * @default true
   */
  enabled?: boolean;
  /**
   * Prefixo da rota para Swagger UI
   * @default "/docs"
   */
  routePrefix?: string;
  /**
   * Usar spec OpenAPI estática (YAML) ou gerar dinamicamente
   * @default false (gerar dinamicamente)
   */
  useStaticSpec?: boolean;
};


/**
 * Configuração base do Swagger
 */
function getSwaggerConfig() {
  const baseUrl = env.NODE_ENV === "production" 
    ? env.FRONTEND_URL?.split(",")[0]?.replace(/\/$/, "") || "https://api.morina.com.br"
    : `http://localhost:${env.API_PORT}`;

  return {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Morina Light API",
        version: "0.1.0",
        description: `
# Morina Light API

API REST para o sistema Morina Light - Catálogo, personalização de marca e notificações em tempo real.

## Autenticação

A API usa autenticação JWT via Bearer Token. Para obter um token:

1. Faça login em \`POST /auth/login\`
2. Use o token retornado no header \`Authorization: Bearer <token>\`

## Multi-tenancy

Todas as requisições (exceto públicas) devem incluir o header:
- \`x-organization-id\`: ID da organização

## Recursos Principais

- **Catálogo**: Gerenciamento de produtos
- **Clientes**: Gerenciamento de clientes
- **Usuários**: Gerenciamento de usuários e permissões
- **Organizações**: Multi-tenancy e configurações
- **Notificações**: Sistema de notificações em tempo real
        `.trim(),
        contact: {
          name: "Suporte Morina",
          email: "suporte@morina.com.br",
        },
        license: {
          name: "Proprietary",
        },
      },
      servers: [
        {
          url: baseUrl,
          description: env.NODE_ENV === "production" ? "Produção" : "Desenvolvimento local",
        },
      ],
      tags: [
        { name: "Health", description: "Endpoints de saúde e status" },
        { name: "Auth", description: "Autenticação e autorização" },
        { name: "Catálogo", description: "Gerenciamento de produtos e catálogo" },
        { name: "Clientes", description: "Gerenciamento de clientes" },
        { name: "Usuários", description: "Gerenciamento de usuários" },
        { name: "Organizações", description: "Gerenciamento de organizações" },
        { name: "Notificações", description: "Sistema de notificações" },
        { name: "Realtime", description: "WebSocket e eventos em tempo real" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Token JWT obtido via POST /auth/login. Formato: 'Bearer <token>'",
          },
          organizationHeader: {
            type: "apiKey",
            in: "header",
            name: "x-organization-id",
            description: "ID da organização (multi-tenancy). Obrigatório em todas as rotas protegidas.",
          },
          actorHeader: {
            type: "apiKey",
            in: "header",
            name: "x-actor-id",
            description: "ID do usuário que está realizando a ação (auditoria)",
          },
        },
      },
      // Security padrão aplicado a todas as rotas (exceto públicas)
      // Rotas públicas devem definir security: [] para remover autenticação
      security: [
        {
          bearerAuth: [],
          organizationHeader: [],
        },
      ],
    },
  };
}

/**
 * Configuração do Swagger UI
 */
function getSwaggerUIConfig(routePrefix: string = "/docs") {
  return {
    routePrefix,
    uiConfig: {
      docExpansion: "list", // 'list', 'full', 'none'
      deepLinking: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    uiHooks: {
      onRequest: async function (_request: any, _reply: any) {
        // Hook para customizar requisições se necessário
      },
      preHandler: async function (_request: any, _reply: any) {
        // Hook pré-handler se necessário
      },
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
    transformSpecification: (swaggerObject: any) => {
      // Customizar spec se necessário
      // Aqui você pode adicionar informações extras, exemplos, etc.
      return swaggerObject;
    },
    transformSpecificationClone: true,
  };
}

/**
 * Registra módulo de documentação OpenAPI/Swagger
 */
export async function registerOpenAPIDocs(
  app: FastifyInstance,
  options: SwaggerOptions = {}
): Promise<void> {
  const { enabled = true, routePrefix = "/docs", useStaticSpec = false } = options;

  if (!enabled) {
    app.log.info("Documentação Swagger desabilitada");
    return;
  }

  try {
    // Registrar @fastify/swagger para gerar especificação OpenAPI
    await app.register(fastifySwagger, getSwaggerConfig());

    // Registrar @fastify/swagger-ui para interface visual
    await app.register(fastifySwaggerUi, getSwaggerUIConfig(routePrefix));

    app.log.info({ routePrefix }, "✅ Documentação Swagger registrada");
    app.log.info({ url: `http://localhost:${env.API_PORT}${routePrefix}` }, "📚 Acesse a documentação em");
  } catch (error) {
    app.log.error({ error }, "❌ Erro ao registrar documentação Swagger");
    throw error;
  }
}

