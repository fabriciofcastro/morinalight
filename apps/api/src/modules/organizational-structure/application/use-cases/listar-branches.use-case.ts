import type { BranchRepository } from "../../domain/repositories/branch-repository";
import { listarBranchesInputSchema, listarBranchesResultadoSchema } from "../schemas/branch.schema";

type Dependencies = {
  branchRepository: BranchRepository;
};

export class ListarBranchesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarBranchesInputSchema.parse(rawInput);

    const branches = await this.deps.branchRepository.findByOrgId(input.orgId);

    // Filtragem em memória (simples) se o repositório não suportar filtros complexos
    // O ideal seria passar os filtros para o repositório
    let filtered = branches;

    if (input.active !== undefined) {
      filtered = filtered.filter((b) => b.dados.active === input.active);
    }

    if (input.busca) {
      const busca = input.busca.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.dados.name.toLowerCase().includes(busca) ||
          b.dados.internalCode?.toLowerCase().includes(busca),
      );
    }

    return listarBranchesResultadoSchema.parse({
      itens: filtered.map((branch) => ({
        branchId: branch.branchId,
        orgId: branch.dados.orgId,
        name: branch.dados.name,
        type: branch.dados.type,
        internalCode: branch.dados.internalCode ?? null,
        cnpj: branch.dados.cnpj ?? null,
        stateRegistration: branch.dados.stateRegistration ?? null,
        address: branch.dados.address ?? null,
        phone: branch.dados.phone ?? null,
        email: branch.dados.email ?? null,
        active: branch.dados.active,
        createdAt: branch.dados.createdAt,
        updatedAt: branch.dados.updatedAt,
      })),
    });
  }
}
