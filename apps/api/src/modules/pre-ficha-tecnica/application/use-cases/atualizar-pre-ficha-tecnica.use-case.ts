import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import { InsumoTecnico } from "../../domain/entities/insumo-tecnico";
import { Tecido } from "../../domain/entities/tecido";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { PreFichaTecnicaId } from "../../domain/value-objects/pre-ficha-tecnica-id";
import { criarPreFichaTecnicaSchema } from "../schemas/pre-ficha-tecnica.schema";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  orgId: string;
  userId: string;
};

const atualizarPreFichaTecnicaSchema = criarPreFichaTecnicaSchema.partial().extend({
  id: z.string().uuid(),
  motivoAlteracao: z
    .string()
    .min(10, "Motivo da alteração deve ter pelo menos 10 caracteres")
    .optional(),
});

export class AtualizarPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarPreFichaTecnicaSchema.parse(rawInput);

    const preFichaId = PreFichaTecnicaId.from(input.id);
    const preFichaExistente = await this.deps.preFichaTecnicaRepository.buscarPorId(
      preFichaId.toString(),
      this.deps.orgId,
    );

    if (!preFichaExistente) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    // Verificar se pode ser editada
    if (!preFichaExistente.status.isEditavel()) {
      throw new Error(
        `Pré-ficha técnica não pode ser editada no status atual: ${preFichaExistente.status.valor}`,
      );
    }

    // Criar nova versão se houver alterações significativas
    const houveAlteracao = input.motivoAlteracao && input.motivoAlteracao.length > 0;

    if (houveAlteracao) {
      // Criar snapshot da versão atual antes de atualizar
      await this.deps.preFichaTecnicaRepository.criarVersao(
        preFichaId.toString(),
        this.deps.orgId,
        {
          versao: preFichaExistente.dados.versaoAtual,
          criadoPor: this.deps.userId,
          motivoAlteracao: input.motivoAlteracao,
          dadosSnapshot: preFichaExistente.dados,
        },
      );
    }

    // Atualizar dados básicos
    if (
      input.codigoPeca ||
      input.nomePecaPiloto ||
      input.categoria !== undefined ||
      input.fotoPecaUrl !== undefined ||
      input.fotoPecaStorageKey !== undefined ||
      input.gradeTamanhos !== undefined ||
      input.observacoesTecnicas !== undefined ||
      input.observacoesOficina !== undefined
    ) {
      preFichaExistente.atualizarDadosBasicos(
        {
          codigoPeca: input.codigoPeca,
          nomePecaPiloto: input.nomePecaPiloto,
          categoria: input.categoria,
          fotoPecaUrl: input.fotoPecaUrl,
          fotoPecaStorageKey: input.fotoPecaStorageKey,
          gradeTamanhos: input.gradeTamanhos,
          observacoesTecnicas: input.observacoesTecnicas,
          observacoesOficina: input.observacoesOficina,
        },
        this.deps.userId,
      );
    }

    // Atualizar responsáveis
    if (
      input.estilistaId !== undefined ||
      input.estilistaNome !== undefined ||
      input.modelistaId !== undefined ||
      input.modelistaNome !== undefined ||
      input.piloteiroId !== undefined ||
      input.piloteiroNome !== undefined
    ) {
      preFichaExistente.atualizarResponsaveis(
        {
          estilistaId: input.estilistaId,
          estilistaNome: input.estilistaNome,
          modelistaId: input.modelistaId,
          modelistaNome: input.modelistaNome,
          piloteiroId: input.piloteiroId,
          piloteiroNome: input.piloteiroNome,
        },
        this.deps.userId,
      );
    }

    // Flags de alteração serão atualizadas quando criarNovaVersao() for chamado

    // Atualizar tecidos
    if (input.tecidos) {
      // Remover todos e adicionar novos
      preFichaExistente.restaurarTecidos([]);
      input.tecidos.forEach((tecido) => {
        const tecidoEntity = Tecido.criar(tecido);
        preFichaExistente.adicionarTecido(tecidoEntity, this.deps.userId);
      });
    }

    // Atualizar insumos técnicos
    if (input.insumosTecnicos) {
      preFichaExistente.restaurarInsumosTecnicos([]);
      input.insumosTecnicos.forEach((insumo) => {
        const insumoEntity = InsumoTecnico.criar(insumo);
        preFichaExistente.adicionarInsumoTecnico(insumoEntity, this.deps.userId);
      });
    }

    // Atualizar checklist técnico
    if (input.checklistTecnico) {
      preFichaExistente.atualizarChecklistTecnico(input.checklistTecnico, this.deps.userId);
    }

    // Incrementar versão se houver alteração
    if (houveAlteracao) {
      preFichaExistente.criarNovaVersao(input.motivoAlteracao ?? null);
    }

    // Salvar
    await this.deps.preFichaTecnicaRepository.salvar(preFichaExistente);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "PreFichaTecnica.Atualizada",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: this.deps.orgId,
          actorId: this.deps.userId,
          timestamp: new Date(),
        },
        payload: {
          preFichaTecnicaId: preFichaExistente.preFichaTecnicaId.toString(),
          orgId: this.deps.orgId,
          versao: preFichaExistente.dados.versaoAtual,
          houveAlteracao,
        },
      });
    }

    return {
      id: preFichaExistente.preFichaTecnicaId.toString(),
      versao: preFichaExistente.dados.versaoAtual,
      status: preFichaExistente.status.valor,
    };
  }
}
