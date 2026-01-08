import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getStorageService } from "../../../core/storage/storage.service";
import { canManage, getTenant } from "../../../core/tenant/tenant.utils";

export async function registerUploadCompanyFileRoute(app: FastifyInstance) {
  app.post("/company-settings/upload", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    // Verificar permissão
    try {
      const tenant = getTenant(request);
      if (!canManage(request)) {
        return reply.status(403).send({
          message: "Sem permissão para fazer upload. Requer role de admin ou owner",
        });
      }

      const orgId = tenant.orgId;

      // Tentar obter arquivo via multipart
      let fileData: any = null;
      try {
        fileData = await (request as any).file();
      } catch {
        // Se não tiver plugin multipart, usar body JSON com base64
        const bodySchema = z.object({
          fileType: z.enum(["logo", "certificate", "document", "favicon", "banner"]),
          fileName: z.string().min(1),
          fileBase64: z.string(),
          mimeType: z.string(),
          description: z.string().optional().nullable(),
        });

        const bodyResult = bodySchema.safeParse(request.body);
        if (!bodyResult.success) {
          return reply.status(400).send({
            message: "Dados inválidos",
            errors: bodyResult.error.errors,
          });
        }

        const { fileType, fileName, fileBase64, mimeType, description } = bodyResult.data;

        // Validar tipo de arquivo baseado no fileType
        if (fileType === "logo" || fileType === "favicon" || fileType === "banner") {
          const validImageTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/svg+xml",
            "image/webp",
          ];
          if (!validImageTypes.includes(mimeType)) {
            return reply.status(400).send({
              message: "Formato de imagem não suportado. Use PNG, JPEG, SVG ou WebP",
            });
          }
        } else if (fileType === "certificate") {
          const validCertTypes = ["application/x-pkcs12", "application/pkcs12"];
          if (
            !validCertTypes.includes(mimeType) &&
            !fileName.endsWith(".pfx") &&
            !fileName.endsWith(".p12")
          ) {
            return reply.status(400).send({
              message: "Formato de certificado não suportado. Use .pfx ou .p12",
            });
          }
        }

        // Converter base64 para buffer
        const buffer = Buffer.from(fileBase64, "base64");

        // Validar tamanho
        const maxSize = fileType === "certificate" ? 1024 * 1024 : 5 * 1024 * 1024; // 1MB para certificado, 5MB para outros
        if (buffer.length > maxSize) {
          return reply.status(400).send({
            message: `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`,
          });
        }

        // Upload para storage
        const storageService = getStorageService();
        const uploadResult = await storageService.uploadFile(
          buffer,
          fileName,
          mimeType,
          `company/${orgId}/${fileType}`,
        );

        return reply.status(200).send({
          url: uploadResult.url,
          storageKey: uploadResult.storageKey,
          fileName,
          fileType,
          mimeType: uploadResult.mimetype,
          size: uploadResult.size,
          description: description || null,
          uploadedAt: new Date().toISOString(),
          uploadedBy: request.auth.userId,
        });
      }

      // Se chegou aqui, tem plugin multipart
      if (!fileData) {
        return reply.status(400).send({ message: "Arquivo não fornecido" });
      }

      const fileType = (request.headers["x-file-type"] as string) || "document";
      const description = (request.headers["x-description"] as string) || null;

      // Validar tipo de arquivo
      if (fileType === "logo" || fileType === "favicon" || fileType === "banner") {
        const validImageTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/svg+xml",
          "image/webp",
        ];
        if (!validImageTypes.includes(fileData.mimetype)) {
          return reply.status(400).send({
            message: "Formato de imagem não suportado. Use PNG, JPEG, SVG ou WebP",
          });
        }
      } else if (fileType === "certificate") {
        if (!fileData.filename.endsWith(".pfx") && !fileData.filename.endsWith(".p12")) {
          return reply.status(400).send({
            message: "Formato de certificado não suportado. Use .pfx ou .p12",
          });
        }
      }

      // Validar tamanho
      const maxSize = fileType === "certificate" ? 1024 * 1024 : 5 * 1024 * 1024;
      const buffer = await fileData.toBuffer();
      if (buffer.length > maxSize) {
        return reply.status(400).send({
          message: `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`,
        });
      }

      // Upload para storage
      const storageService = getStorageService();
      const uploadResult = await storageService.uploadFile(
        buffer,
        fileData.filename,
        fileData.mimetype,
        `company/${orgId}/${fileType}`,
      );

      return reply.status(200).send({
        url: uploadResult.url,
        storageKey: uploadResult.storageKey,
        fileName: fileData.filename,
        fileType,
        mimeType: uploadResult.mimetype,
        size: uploadResult.size,
        description: description || null,
        uploadedAt: new Date().toISOString(),
        uploadedBy: request.auth.userId,
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      return reply.status(500).send({
        message: "Erro interno ao processar upload",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });
}
