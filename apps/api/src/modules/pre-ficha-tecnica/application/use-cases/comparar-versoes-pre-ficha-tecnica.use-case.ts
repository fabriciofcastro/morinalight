import { getPrisma } from "../../../../infra/database/prisma.service";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { PreFichaTecnicaId } from "../../domain/value-objects/pre-ficha-tecnica-id";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  orgId: string;
};

export class CompararVersoesPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(preFichaTecnicaId: string, versao1: number, versao2: number) {
    const prisma = getPrisma();

    // Buscar versões
    const [versao1Data, versao2Data] = await Promise.all([
      versao1 === 0
        ? this.deps.preFichaTecnicaRepository
            .buscarPorId(preFichaTecnicaId, this.deps.orgId)
            .then((p) => p?.toJSON())
        : prisma.versaoPreFichaTecnica.findFirst({
            where: {
              preFichaTecnicaId,
              versao: versao1,
            },
            select: {
              versao: true,
              dadosSnapshot: true,
              createdAt: true,
              criadoPor: true,
            },
          }),
      versao2 === 0
        ? this.deps.preFichaTecnicaRepository
            .buscarPorId(preFichaTecnicaId, this.deps.orgId)
            .then((p) => p?.toJSON())
        : prisma.versaoPreFichaTecnica.findFirst({
            where: {
              preFichaTecnicaId,
              versao: versao2,
            },
            select: {
              versao: true,
              dadosSnapshot: true,
              createdAt: true,
              criadoPor: true,
            },
          }),
    ]);

    if (!versao1Data || !versao2Data) {
      throw new Error("Uma ou ambas as versões não foram encontradas");
    }

    const dados1 = versao1 === 0 ? versao1Data : (versao1Data as any).dadosSnapshot;
    const dados2 = versao2 === 0 ? versao2Data : (versao2Data as any).dadosSnapshot;

    // Comparar campos
    const diff = this.compararDados(dados1, dados2);

    return {
      versao1: versao1 === 0 ? "atual" : versao1,
      versao2: versao2 === 0 ? "atual" : versao2,
      dados1: versao1 === 0 ? versao1Data : (versao1Data as any).dadosSnapshot,
      dados2: versao2 === 0 ? versao2Data : (versao2Data as any).dadosSnapshot,
      diff,
      metadata1: versao1 === 0 ? null : versao1Data,
      metadata2: versao2 === 0 ? null : versao2Data,
    };
  }

  private compararDados(
    dados1: any,
    dados2: any,
  ): Array<{
    campo: string;
    valorAnterior: any;
    valorNovo: any;
    tipo: "alterado" | "adicionado" | "removido";
  }> {
    const diff: Array<{
      campo: string;
      valorAnterior: any;
      valorNovo: any;
      tipo: "alterado" | "adicionado" | "removido";
    }> = [];

    const campos = new Set([...Object.keys(dados1 || {}), ...Object.keys(dados2 || {})]);

    for (const campo of campos) {
      const valor1 = dados1?.[campo];
      const valor2 = dados2?.[campo];

      // Ignorar campos de auditoria
      if (
        campo === "createdAt" ||
        campo === "updatedAt" ||
        campo === "createdBy" ||
        campo === "updatedBy"
      ) {
        continue;
      }

      if (valor1 === undefined && valor2 !== undefined) {
        diff.push({
          campo,
          valorAnterior: null,
          valorNovo: valor2,
          tipo: "adicionado",
        });
      } else if (valor1 !== undefined && valor2 === undefined) {
        diff.push({
          campo,
          valorAnterior: valor1,
          valorNovo: null,
          tipo: "removido",
        });
      } else if (JSON.stringify(valor1) !== JSON.stringify(valor2)) {
        diff.push({
          campo,
          valorAnterior: valor1,
          valorNovo: valor2,
          tipo: "alterado",
        });
      }
    }

    return diff;
  }
}
