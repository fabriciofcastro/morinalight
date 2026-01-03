import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { checkOrganizationAccess } from "../../../core/auth/rbac.guards";
import { getStorageService } from "../../../core/storage/storage.service";
import type { OrganizationRepository } from "../../../organizations/repositories/organization.repository";
import type { SupplierRepository } from "../../repositories/supplier.repository";
import type { DocumentoSupplierRepository } from "../../repositories/supplier-document.repository";

type UploadDocumentoDeps = {
  supplierRepository: SupplierRepository;
  organizationRepository: OrganizationRepository;
  documentRepository: DocumentoSupplierRepository;
};

export async function registerUploadDocumentoSupplierRoute(
  app: FastifyInstance,
  deps: UploadDocumentoDeps,
) {
  app.post("/suppliers/:id/documentos/upload", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const supplier = await deps.supplierRepository.findById(id);
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    try {
      // Tentar obter arquivo via multipart (se plugin estiver instalado)
      let fileData: any = null;
      try {
        fileData = await (request as any).file();
      } catch {
        // Se não tiver plugin multipart, usar body JSON com base64
        const body = z.object({
          tipo: z.enum(["foto_peca", "nota_fiscal", "boleto", "comprovante_pagamento", "outros"]),
          nomeArquivo: z.string().min(1),
          arquivoBase64: z.string(),
          mimeType: z.string(),
          descricao: z.string().optional().nullable(),
        }).parse(request.body);

        // Converter base64 para buffer
        const buffer = Buffer.from(body.arquivoBase64, "base64");
        const storageService = getStorageService();
        const uploadResult = await storageService.uploadFile(
          buffer,
          body.nomeArquivo,
          body.mimeType,
          `suppliers/${supplier.orgId}/${id}`,
        );

        const documento = await deps.documentRepository.create({
          supplierId: id,
          tipo: body.tipo,
          nomeArquivo: body.nomeArquivo,
          arquivoUrl: uploadResult.url,
          arquivoStorageKey: uploadResult.storageKey,
          tamanhoBytes: BigInt(uploadResult.size),
          mimeType: uploadResult.mimetype,
          descricao: body.descricao || null,
          anexadoPor: request.auth.userId,
        });

        return reply.status(201).send({
          id: documento.id,
          tipo: documento.tipo,
          nomeArquivo: documento.nomeArquivo,
          arquivoUrl: documento.arquivoUrl,
          tamanhoBytes: Number(documento.tamanhoBytes),
          mimeType: documento.mimeType,
          descricao: documento.descricao,
          anexadoPor: documento.anexadoPor,
          createdAt: documento.createdAt.toISOString(),
        });
      }

      // Se chegou aqui, tem plugin multipart
      if (!fileData) {
        return reply.status(400).send({ message: "Arquivo não fornecido" });
      }

      const tipo = (request.headers["x-tipo-documento"] as string) || "outros";
      const descricao = (request.headers["x-descricao"] as string) || null;

      // Validar tipo de arquivo
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(fileData.mimetype)) {
        return reply.status(400).send({
          message: "Formato não suportado",
        });
      }

      // Validar tamanho (10MB)
      const maxSize = 10 * 1024 * 1024;
      const buffer = await fileData.toBuffer();
      if (buffer.length > maxSize) {
        return reply.status(400).send({
          message: "Arquivo muito grande. Tamanho máximo: 10MB",
        });
      }

      // Upload para storage
      const storageService = getStorageService();
      const uploadResult = await storageService.uploadFile(
        buffer,
        fileData.filename,
        fileData.mimetype,
        `suppliers/${supplier.orgId}/${id}`,
      );

      const documento = await deps.documentRepository.create({
        supplierId: id,
        tipo: tipo as any,
        nomeArquivo: fileData.filename,
        arquivoUrl: uploadResult.url,
        arquivoStorageKey: uploadResult.storageKey,
        tamanhoBytes: BigInt(uploadResult.size),
        mimeType: uploadResult.mimetype,
        descricao,
        anexadoPor: request.auth.userId,
      });

      return reply.status(201).send({
        id: documento.id,
        tipo: documento.tipo,
        nomeArquivo: documento.nomeArquivo,
        arquivoUrl: documento.arquivoUrl,
        tamanhoBytes: Number(documento.tamanhoBytes),
        mimeType: documento.mimeType,
        descricao: documento.descricao,
        anexadoPor: documento.anexadoPor,
        createdAt: documento.createdAt.toISOString(),
      });
    } catch (error) {
      app.log.error(error, "Erro ao fazer upload de documento");
      return reply.status(500).send({ message: "Erro ao fazer upload do documento" });
    }
  });
}


