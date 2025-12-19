import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";

export async function registerUploadFichaCustoRoute(app: FastifyInstance) {
  app.post(
    "/organizations/:orgId/fichas-custo/upload",
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

        // Obter tipo do arquivo (foto ou documento)
        const tipo = request.headers["x-upload-type"] as string | undefined;

        // Validar tipo de arquivo baseado no tipo
        if (tipo === "foto") {
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
        } else if (tipo === "documento") {
          const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
          if (!validTypes.includes(data.mimetype)) {
            return reply.status(400).send({
              message: "Formato não suportado. Use PDF, JPG ou PNG",
            });
          }

          // Validar tamanho (10MB)
          const maxSize = 10 * 1024 * 1024;
          if (data.file.bytesRead > maxSize) {
            return reply.status(400).send({
              message: "Arquivo muito grande. Tamanho máximo: 10MB",
            });
          }
        } else {
          return reply.status(400).send({
            message: "Tipo de upload inválido. Use 'foto' ou 'documento'",
          });
        }

        // Ler o arquivo
        const buffer = await data.toBuffer();
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${data.mimetype};base64,${base64}`;

        // TODO: Em produção, fazer upload para S3/MinIO e retornar URL real
        // Por enquanto, retornamos data URL (não ideal para produção, mas funcional)
        const storageKey = `fichas-custo/${orgId}/${tipo}/${Date.now()}-${data.filename}`;

        return reply.status(200).send({
          url: dataUrl,
          storageKey,
          filename: data.filename,
          mimetype: data.mimetype,
          size: data.file.bytesRead,
        });
      } catch (error) {
        app.log.error(error, "Erro ao fazer upload de arquivo");
        return reply.status(500).send({ message: "Erro ao fazer upload do arquivo" });
      }
    },
  );
}


