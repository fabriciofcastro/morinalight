export type OrganizationRole = "owner" | "admin" | "manager" | "member" | "viewer";

export type TenantContext = {
  orgId: string;
  userId: string;
  role: OrganizationRole;
};

declare module "fastify" {
  interface FastifyRequest {
    tenant?: TenantContext;
  }
}
