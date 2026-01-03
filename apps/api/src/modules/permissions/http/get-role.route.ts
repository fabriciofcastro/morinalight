import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { RoleRepository } from "../domain/repositories/role-repository";

type Dependencies = {
  roleRepository: RoleRepository;
};

export async function registerGetRoleRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/roles/:roleId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const { roleId } = request.params as { roleId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const role = await deps.roleRepository.findById(roleId);
      if (!role || role.dados.orgId !== orgId) {
        return reply.status(404).send({ message: "Perfil não encontrado" });
      }

      return reply.status(200).send({
        roleId: role.roleId,
        orgId: role.dados.orgId,
        name: role.dados.name,
        code: role.dados.code,
        description: role.dados.description ?? null,
        scope: role.dados.scope,
        active: role.dados.active,
        isCustom: true,
        createdAt: role.dados.createdAt,
        updatedAt: role.dados.updatedAt,
      });
    } catch (error) {
      app.log.error(error, "Erro ao buscar perfil");
      return reply.status(500).send({ message: "Erro ao buscar perfil" });
    }
  });
}
