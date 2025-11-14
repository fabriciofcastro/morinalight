import { z } from "zod";
import { randomUUID } from "crypto";
import type { PermissionTemplateRepository } from "../../domain/repositories/permission-template-repository";

const criarPermissionTemplateInputSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  entityType: z.enum(["position", "sector", "department", "all"]),
  permissions: z.array(
    z.object({
      permissionId: z.string(),
      granted: z.boolean(),
    }),
  ),
  isDefault: z.boolean().default(false),
});

type Dependencies = {
  templateRepository: PermissionTemplateRepository;
  actorId: string;
};

export class CriarPermissionTemplateUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarPermissionTemplateInputSchema.parse(rawInput);

    // Verificar se já existe template com o mesmo nome e tipo
    const existente = await this.deps.templateRepository.encontrarPorNomeEEntityType(
      input.orgId,
      input.name,
      input.entityType,
    );

    if (existente) {
      throw new Error(`Já existe um template com o nome "${input.name}" para ${input.entityType}`);
    }

    const template = {
      id: randomUUID(),
      orgId: input.orgId,
      name: input.name,
      description: input.description ?? null,
      entityType: input.entityType,
      permissions: input.permissions,
      isDefault: input.isDefault,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    };

    await this.deps.templateRepository.salvar(template);

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      entityType: template.entityType,
      permissions: template.permissions,
      isDefault: template.isDefault,
      isSystem: template.isSystem,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}

