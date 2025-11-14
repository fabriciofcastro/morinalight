import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import {
  listarDepartmentsInputSchema,
  listarDepartmentsResultadoSchema,
  departmentViewSchema,
} from "../schemas/department.schema";

type Dependencies = {
  departmentRepository: DepartmentRepository;
};

export class ListarDepartmentsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarDepartmentsInputSchema.parse(rawInput);

    const pagina = await this.deps.departmentRepository.listarPorOrg(input.orgId, {
      status: input.status,
      unitId: input.unitId,
      parentId: input.parentId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((department) =>
      departmentViewSchema.parse({
        departmentId: department.departmentId,
        orgId: department.dados.orgId,
        unitId: department.dados.unitId ?? null,
        name: department.dados.name,
        code: department.dados.code,
        description: department.dados.description ?? null,
        parentId: department.dados.parentId ?? null,
        status: department.dados.status,
        ordem: department.dados.ordem,
        metadata: department.dados.metadata ?? null,
        createdBy: department.dados.createdBy,
        updatedBy: department.dados.updatedBy,
        createdAt: department.dados.createdAt,
        updatedAt: department.dados.updatedAt,
      }),
    );

    return listarDepartmentsResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

