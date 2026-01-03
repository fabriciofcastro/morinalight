import { z } from "zod";
import { getPrisma } from "../../../../infra/database/prisma.service";

type Dependencies = {
  orgId: string;
};

const listarVersoesSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
  pagina: z.number().int().positive().default(1),
  tamanhoPagina: z.number().int().positive().max(100).default(20),
});

export class ListarVersoesPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarVersoesSchema.parse(rawInput);
    const prisma = getPrisma();

    // Verificar se a pré-ficha existe
    const preFicha = await prisma.preFichaTecnica.findFirst({
      where: {
        id: input.preFichaTecnicaId,
        orgId: this.deps.orgId,
      },
      select: { id: true },
    });

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    // Buscar versões
    const [versoes, total] = await Promise.all([
      prisma.versaoPreFichaTecnica.findMany({
        where: {
          preFichaTecnicaId: input.preFichaTecnicaId,
        },
        orderBy: { versao: "desc" },
        skip: (input.pagina - 1) * input.tamanhoPagina,
        take: input.tamanhoPagina,
        select: {
          id: true,
          versao: true,
          criadoPor: true,
          motivoAlteracao: true,
          createdAt: true,
          dadosSnapshot: true,
        },
      }),
      prisma.versaoPreFichaTecnica.count({
        where: {
          preFichaTecnicaId: input.preFichaTecnicaId,
        },
      }),
    ]);

    return {
      itens: versoes.map((v) => ({
        id: v.id,
        versao: v.versao,
        criadoPor: v.criadoPor,
        motivoAlteracao: v.motivoAlteracao,
        createdAt: v.createdAt,
        dadosSnapshot: v.dadosSnapshot,
      })),
      total,
      pagina: input.pagina,
      tamanhoPagina: input.tamanhoPagina,
      totalPaginas: Math.ceil(total / input.tamanhoPagina),
    };
  }
}












