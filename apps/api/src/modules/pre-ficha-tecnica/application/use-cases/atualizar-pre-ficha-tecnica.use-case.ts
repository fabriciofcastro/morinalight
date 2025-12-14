import { z } from "zod";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { PreFichaTecnicaId } from "../../domain/value-objects/pre-ficha-tecnica-id";
import { criarPreFichaTecnicaSchema } from "../schemas/pre-ficha-tecnica.schema";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  orgId: string;
  userId: string;
};

const atualizarPreFichaTecnicaSchema = criarPreFichaTecnicaSchema.partial().extend({
  id: z.string().uuid(),
  motivoAlteracao: z.string().min(10, "Motivo da alteração deve ter pelo menos 10 caracteres").optional(),
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
          dadosSnapshot: preFichaExistente.toJSON(),
        },
      );
    }

    // Atualizar dados básicos
    if (input.codigoPeca) {
      preFichaExistente.atualizarDadosBasicos({
        codigoPeca: input.codigoPeca,
        nomePecaPiloto: input.nomePecaPiloto || preFichaExistente.dados.nomePecaPiloto,
        categoria: input.categoria ?? preFichaExistente.dados.categoria,
        fotoPecaUrl: input.fotoPecaUrl ?? preFichaExistente.dados.fotoPecaUrl,
        fotoPecaStorageKey: input.fotoPecaStorageKey ?? preFichaExistente.dados.fotoPecaStorageKey,
        gradeTamanhos: input.gradeTamanhos ?? preFichaExistente.dados.gradeTamanhos,
        observacoesTecnicas: input.observacoesTecnicas ?? preFichaExistente.dados.observacoesTecnicas,
        observacoesOficina: input.observacoesOficina ?? preFichaExistente.dados.observacoesOficina,
        estilistaId: input.estilistaId ?? preFichaExistente.dados.estilistaId,
        estilistaNome: input.estilistaNome ?? preFichaExistente.dados.estilistaNome,
        modelistaId: input.modelistaId ?? preFichaExistente.dados.modelistaId,
        modelistaNome: input.modelistaNome ?? preFichaExistente.dados.modelistaNome,
        piloteiroId: input.piloteiroId ?? preFichaExistente.dados.piloteiroId,
        piloteiroNome: input.piloteiroNome ?? preFichaExistente.dados.piloteiroNome,
        houveAlteracao: houveAlteracao,
        descricaoAlteracao: input.motivoAlteracao ?? null,
      });
    }

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

    // Marcar como atualizado
    preFichaExistente.marcarComoAtualizado(this.deps.userId);

    // Incrementar versão se houver alteração
    if (houveAlteracao) {
      preFichaExistente.criarNovaVersao();
    }

    // Salvar
    await this.deps.preFichaTecnicaRepository.salvar(preFichaExistente);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "pre-ficha-tecnica.atualizada",
        payload: {
          id: preFichaExistente.preFichaTecnicaId.toString(),
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

