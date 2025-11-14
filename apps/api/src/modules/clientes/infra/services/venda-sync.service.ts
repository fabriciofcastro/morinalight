/**
 * Serviço para sincronizar vendas do e-millennium e calcular comissões
 *
 * Este serviço:
 * 1. Busca vendas do e-millennium
 * 2. Cria registros de Venda no sistema
 * 3. Calcula comissões baseado no contrato vigente do representante
 * 4. Cria registros de Comissão pendentes de assinatura
 */

import { Comissao } from "../../domain/entities/comissao";
import { Venda } from "../../domain/entities/venda";
import type { ClienteRepository } from "../../domain/repositories/cliente-repository";
import type { ComissaoRepository } from "../../domain/repositories/comissao-repository";
import type { ContratoRepository } from "../../domain/repositories/contrato-repository";
import type { RepresentanteRepository } from "../../domain/repositories/representante-repository";
import type { EmillenniumClient } from "../integrations/emillennium-client";

type VendaSyncServiceDeps = {
  clienteRepository: ClienteRepository;
  representanteRepository: RepresentanteRepository;
  contratoRepository: ContratoRepository;
  comissaoRepository: ComissaoRepository;
  vendaRepository: VendaRepository;
  emillenniumClient: EmillenniumClient;
};

export interface VendaRepository {
  salvar(venda: Venda): Promise<void>;
  encontrarPorNumeroPedido(orgId: string, numeroPedido: string): Promise<Venda | null>;
  encontrarPorEmillenniumId(orgId: string, emillenniumPedidoId: string): Promise<Venda | null>;
}

export class VendaSyncService {
  constructor(private readonly deps: VendaSyncServiceDeps) {}

  /**
   * Sincroniza vendas do e-millennium para o período especificado
   */
  async sincronizarVendas(params: {
    orgId: string;
    dataInicio: Date;
    dataFim: Date;
    actorId: string;
  }): Promise<{ vendasCriadas: number; comissoesCriadas: number; erros: number }> {
    let vendasCriadas = 0;
    let comissoesCriadas = 0;
    let erros = 0;

    try {
      // Buscar pedidos do e-millennium
      const pedidos = await this.deps.emillenniumClient.buscarPedidos({
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
        status: "confirmada", // Apenas vendas confirmadas
      });

      for (const pedido of pedidos) {
        try {
          // Verificar se a venda já existe
          const vendaExistente = await this.deps.vendaRepository.encontrarPorEmillenniumId(
            params.orgId,
            pedido.id,
          );

          if (vendaExistente) {
            continue; // Venda já sincronizada
          }

          // Buscar cliente por documento
          let clienteId: string | null = null;
          if (pedido.clienteDocumento) {
            const cliente = await this.deps.clienteRepository.encontrarPorDocumento(
              params.orgId,
              pedido.clienteDocumento,
            );

            if (!cliente) {
              console.warn(`Cliente não encontrado para documento ${pedido.clienteDocumento}`);
              erros++;
              continue;
            }

            clienteId = cliente.clienteId;
          }

          if (!clienteId) {
            console.warn(`Pedido ${pedido.numeroPedido} sem cliente associado`);
            erros++;
            continue;
          }

          // Buscar representante do cliente
          const representante = await this.deps.representanteRepository.encontrarPorClienteId(
            params.orgId,
            clienteId,
          );

          if (!representante) {
            // Venda sem representante - criar venda mas sem comissão
            const venda = Venda.criar({
              orgId: params.orgId,
              clienteId,
              numeroPedido: pedido.numeroPedido,
              numeroNotaFiscal: pedido.numeroNotaFiscal ?? null,
              dataVenda: new Date(pedido.dataVenda),
              dataPagamento: pedido.dataPagamento ? new Date(pedido.dataPagamento) : null,
              valorTotal: Number(pedido.valorTotal),
              valorComissao: 0,
              status: pedido.status,
              emillenniumPedidoId: pedido.id,
              emillenniumSyncAt: new Date(),
              createdBy: params.actorId,
              updatedBy: params.actorId,
            });

            await this.deps.vendaRepository.salvar(venda);
            vendasCriadas++;
            continue;
          }

          // Buscar contrato vigente do representante
          const contratosVigentes =
            await this.deps.contratoRepository.listarVigentesPorRepresentante(
              params.orgId,
              representante.representanteId,
            );

          if (contratosVigentes.length === 0) {
            console.warn(`Representante ${representante.representanteId} sem contrato vigente`);
            // Criar venda sem comissão
            const venda = Venda.criar({
              orgId: params.orgId,
              clienteId,
              numeroPedido: pedido.numeroPedido,
              numeroNotaFiscal: pedido.numeroNotaFiscal ?? null,
              dataVenda: new Date(pedido.dataVenda),
              dataPagamento: pedido.dataPagamento ? new Date(pedido.dataPagamento) : null,
              valorTotal: Number(pedido.valorTotal),
              valorComissao: 0,
              status: pedido.status,
              emillenniumPedidoId: pedido.id,
              emillenniumSyncAt: new Date(),
              createdBy: params.actorId,
              updatedBy: params.actorId,
            });

            await this.deps.vendaRepository.salvar(venda);
            vendasCriadas++;
            erros++;
            continue;
          }

          // Usar o contrato mais recente vigente
          const contrato = contratosVigentes.sort(
            (a, b) => b.dados.dataInicio.getTime() - a.dados.dataInicio.getTime(),
          )[0];

          // Calcular comissão baseado no contrato
          const percentualComissao = Number(contrato.dados.percentualComissao);
          const valorComissao = (Number(pedido.valorTotal) * percentualComissao) / 100;

          // Criar venda
          const venda = Venda.criar({
            orgId: params.orgId,
            clienteId,
            numeroPedido: pedido.numeroPedido,
            numeroNotaFiscal: pedido.numeroNotaFiscal ?? null,
            dataVenda: new Date(pedido.dataVenda),
            dataPagamento: pedido.dataPagamento ? new Date(pedido.dataPagamento) : null,
            valorTotal: Number(pedido.valorTotal),
            valorComissao,
            status: pedido.status,
            emillenniumPedidoId: pedido.id,
            emillenniumSyncAt: new Date(),
            createdBy: params.actorId,
            updatedBy: params.actorId,
          });

          await this.deps.vendaRepository.salvar(venda);
          vendasCriadas++;

          // Criar comissão pendente de assinatura
          const comissao = Comissao.criar({
            orgId: params.orgId,
            representanteId: representante.representanteId,
            clienteId,
            vendaId: venda.vendaId,
            valorComissao,
            percentualAplicado: percentualComissao,
            dataVenda: new Date(pedido.dataVenda),
            status: "pendente", // Pendente de assinatura do representante
            createdBy: params.actorId,
            updatedBy: params.actorId,
          });

          await this.deps.comissaoRepository.salvar(comissao);
          comissoesCriadas++;
        } catch (error) {
          console.error(`Erro ao processar pedido ${pedido.numeroPedido}:`, error);
          erros++;
        }
      }

      return { vendasCriadas, comissoesCriadas, erros };
    } catch (error) {
      console.error("Erro ao sincronizar vendas:", error);
      throw new Error("Falha ao sincronizar vendas do e-millennium");
    }
  }
}
