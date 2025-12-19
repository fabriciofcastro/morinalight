import type { SubdepartmentRepository } from "../../domain/repositories/subdepartment-repository";
import {
  subdepartmentViewSchema,
  listarSubdepartmentsInputSchema,
  listarSubdepartmentsResultadoSchema,
} from "../schemas/subdepartment.schema";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
};

export class ListarSubdepartmentsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarSubdepartmentsInputSchema.parse(rawInput);

    const pagina = await this.deps.subdepartmentRepository.listarPorOrg(input.orgId, {
      status: input.status,
      branchId: input.branchId,
      departmentId: input.departmentId,
      parentId: input.parentId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((subdepartment) =>
      subdepartmentViewSchema.parse({
        subdepartmentId: subdepartment.subdepartmentId,
        orgId: subdepartment.dados.orgId,
        branchId: subdepartment.dados.branchId ?? null,
        departmentId: subdepartment.dados.departmentId,
        name: subdepartment.dados.name,
        code: subdepartment.dados.code,
        description: subdepartment.dados.description ?? null,
        parentId: subdepartment.dados.parentId ?? null,
        status: subdepartment.dados.status,
        ordem: subdepartment.dados.ordem,
        metadata: subdepartment.dados.metadata ?? null,
        createdBy: subdepartment.dados.createdBy,
        updatedBy: subdepartment.dados.updatedBy,
        createdAt: subdepartment.dados.createdAt,
        updatedAt: subdepartment.dados.updatedAt,
      }),
    );

    return listarSubdepartmentsResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

