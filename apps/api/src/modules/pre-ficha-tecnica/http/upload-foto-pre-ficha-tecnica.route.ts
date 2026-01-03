import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";

export async function registerUploadFotoPreFichaTecnicaRoute(app: FastifyInstance) {
  app.post(
    "/organizations/:orgId/pre-fichas-tecnicas/upload-foto",
    async (request: FastifyRequest<{ Params: { orgId: string } }>, reply: FastifyReply) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const orgId = request.params.orgId;
      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      try {
        const data = await request.file();

        if (!data) {
          return reply.status(400).send({ message: "Arquivo não fornecido" });
        }

        // Validar tipo
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(data.mimetype)) {
          return reply.status(400).send({
            message: "Formato não suportado. Use JPEG, PNG ou WebP",
          });
        }

        // Validar tamanho (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (data.file.bytesRead > maxSize) {
          return reply.status(400).send({
            message: "Arquivo muito grande. Tamanho máximo: 5MB",
          });
        }

        // Ler o arquivo
        const buffer = await data.toBuffer();
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${data.mimetype};base64,${base64}`;

        // TODO: Em produção, fazer upload para S3/MinIO e retornar URL real
        // Por enquanto, retornamos data URL (não ideal para produção, mas funcional)
        const storageKey = `pre-fichas-tecnicas/${orgId}/${Date.now()}-${data.filename}`;

        return reply.status(200).send({
          url: dataUrl,
          storageKey,
          filename: data.filename,
          mimetype: data.mimetype,
          size: data.file.bytesRead,
        });
      } catch (error) {
        app.log.error(error, "Erro ao fazer upload de foto");
        return reply.status(500).send({ message: "Erro ao fazer upload da foto" });
      }
    },
  );
}
