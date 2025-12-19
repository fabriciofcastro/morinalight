import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { checkOrganizationAccess } from "../../../core/auth/rbac.guards";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { SupplierRepository } from "../repositories/supplier.repository";
import { SupplierImportService } from "../services/supplier-import.service";
import type { SupplierImportRow } from "../utils/import-validator";

type ImportDeps = {
  supplierRepository: SupplierRepository;
  organizationRepository: OrganizationRepository;
};

export async function registerSupplierImportRoutes(
  app: FastifyInstance,
  deps: ImportDeps,
) {
  const importService = new SupplierImportService(deps.supplierRepository);

  // Register multipart plugin if not already registered
  try {
    if (!app.hasPlugin("@fastify/multipart")) {
      const multipart = await import("@fastify/multipart");
      await app.register(multipart.default);
    }
  } catch (error) {
    // Plugin may not be installed, will use fallback JSON method
    console.warn("Multipart plugin not available, using JSON fallback");
  }

  /**
   * POST /suppliers/import/validate
   * Upload and validate file for import
   */
  app.post("/suppliers/import/validate", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const orgId = z.string().min(1).parse(request.headers["x-org-id"]);

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    try {
      // Try to get file via multipart
      let fileData: any = null;
      let fileName = "";
      let fileBuffer: Buffer | null = null;

      try {
        const data = await (request as any).file();
        fileData = data;
        fileName = data.filename;
        const chunks: Buffer[] = [];
        for await (const chunk of data.file) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      } catch (error) {
        // Fallback: try JSON with base64
        const body = z
          .object({
            fileName: z.string(),
            fileContent: z.string(), // base64
            columnMapping: z.record(z.string()).optional(),
          })
          .parse(request.body);

        fileName = body.fileName;
        fileBuffer = Buffer.from(body.fileContent, "base64");
      }

      if (!fileBuffer || !fileName) {
        return reply.status(400).send({ message: "Arquivo não fornecido" });
      }

      // Validate file type
      const isCSV = fileName.endsWith(".csv");
      const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
      if (!isCSV && !isExcel) {
        return reply.status(400).send({
          message: "Formato de arquivo não suportado. Use CSV ou Excel (XLSX/XLS)",
        });
      }

      // Get optional column mapping from request
      const body = request.body as any;
      const columnMapping = body.columnMapping as Record<string, string> | undefined;

      // Parse and validate
      const preview = await importService.parseAndValidate(fileBuffer, fileName, orgId, columnMapping);

      return reply.send({
        success: true,
        preview,
      });
    } catch (error) {
      console.error("Erro ao validar importação:", error);
      return reply.status(500).send({
        message: error instanceof Error ? error.message : "Erro ao processar arquivo",
      });
    }
  });

  /**
   * POST /suppliers/import/execute
   * Execute import with validated data
   */
  app.post("/suppliers/import/execute", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const orgId = z.string().min(1).parse(request.headers["x-org-id"]);

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    try {
      const body = z
        .object({
          rows: z.array(
            z.object({
              name: z.string().optional(),
              document: z.string().optional(),
              email: z.string().optional(),
              phone: z.string().optional(),
              address: z.string().optional(),
              city: z.string().optional(),
              state: z.string().optional(),
              zipCode: z.string().optional(),
              website: z.string().optional(),
              ramoAtividade: z.string().optional(),
              tipoFornecedor: z.string().optional(),
              prazoPagamento: z.number().optional(),
              condicaoPagamento: z.string().optional(),
              limiteCredito: z.number().optional(),
              contatoPrincipal: z.string().optional(),
              cargoContato: z.string().optional(),
              notes: z.string().optional(),
            }),
          ),
        })
        .parse(request.body);

      const result = await importService.executeImport(
        body.rows as SupplierImportRow[],
        orgId,
        request.auth.userId,
      );

      return reply.send({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Erro ao executar importação:", error);
      return reply.status(500).send({
        message: error instanceof Error ? error.message : "Erro ao executar importação",
      });
    }
  });

  /**
   * GET /suppliers/import/template
   * Download template file for import
   */
  app.get("/suppliers/import/template", async (request: FastifyRequest, reply: FastifyReply) => {
    // CSV template
    const csvTemplate = `nome,cnpj,email,telefone,endereco,cidade,estado,cep,website,ramo_atividade,tipo_fornecedor,prazo_pagamento,condicao_pagamento,limite_credito,contato_principal,cargo_contato,notas
Fornecedor Exemplo,12345678000190,contato@exemplo.com,11999999999,Rua Exemplo 123,São Paulo,SP,01234567,https://exemplo.com,Textil,Fornecedor,30,Dinheiro,10000.00,João Silva,Gerente,Fornecedor de tecidos`;

    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="template_fornecedores.csv"');
    return reply.send(csvTemplate);
  });
}

