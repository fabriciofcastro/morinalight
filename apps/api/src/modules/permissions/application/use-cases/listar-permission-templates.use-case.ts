import { z } from "zod";
import type { PermissionTemplateRepository } from "../../domain/repositories/permission-template-repository";

const listarPermissionTemplatesInputSchema = z.object({
  orgId: z.string().uuid(),
  entityType: z.enum(["position", "sector", "department", "all"]).optional(),
  isDefault: z.boolean().optional(),
  isSystem: z.boolean().optional(),
});

type Dependencies = {
  templateRepository: PermissionTemplateRepository;
};

export class ListarPermissionTemplatesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPermissionTemplatesInputSchema.parse(rawInput);

    const filtro = {
      entityType: input.entityType,
      isDefault: input.isDefault,
      isSystem: input.isSystem,
    };

    const templates = await this.deps.templateRepository.listarPorOrg(input.orgId, filtro);

    return {
      itens: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        entityType: template.entityType,
        permissions: template.permissions,
        isDefault: template.isDefault,
        isSystem: template.isSystem,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })),
    };
  }
}

