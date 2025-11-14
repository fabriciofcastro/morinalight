import type { FastifyInstance } from "fastify";
import type { AuthModuleOptions as CoreAuthModuleOptions } from "../../core/auth/auth.module";
import { registerAuthModule as registerCoreAuthModule } from "../../core/auth/auth.module";
import type { AuthModuleOptions } from "../../modules/auth/auth.module";
import { registerAuthModule } from "../../modules/auth/auth.module";
import type { CatalogoModuleOptions } from "../../modules/catalogo/catalogo.module";
import { registerCatalogoModule } from "../../modules/catalogo/catalogo.module";
import { registerCompanySettingsModule } from "../../modules/company-settings/company-settings.module";
import type { NotificationsModuleOptions } from "../../modules/notifications/notifications.module";
import { registerNotificationsModule } from "../../modules/notifications/notifications.module";
import type { OrganizationsModuleOptions } from "../../modules/organizations/organizations.module";
import { registerOrganizationsModule } from "../../modules/organizations/organizations.module";
import type { PrefichaModuleOptions } from "../../modules/preficha/preficha.module";
import { registerPrefichaModule } from "../../modules/preficha/preficha.module";
import type { SuppliersModuleOptions } from "../../modules/suppliers/suppliers.module";
import { registerSuppliersModule } from "../../modules/suppliers/suppliers.module";
import type { UsersModuleOptions } from "../../modules/users/users.module";
import { registerUsersModule } from "../../modules/users/users.module";
import type { ClientesModuleOptions } from "../../modules/clientes/clientes.module";
import { registerClientesModule } from "../../modules/clientes/clientes.module";
import type { PermissionsModuleOptions } from "../../modules/permissions/permissions.module";
import { registerPermissionsModule } from "../../modules/permissions/permissions.module";
import type { OrganizationalStructureModuleOptions } from "../../modules/organizational-structure/organizational-structure.module";
import { registerOrganizationalStructureModule } from "../../modules/organizational-structure/organizational-structure.module";
import { registerRealtimeRoutes } from "../../modules/realtime/realtime.routes";

type HttpModulesOptions = {
  catalogo?: CatalogoModuleOptions;
  preficha?: PrefichaModuleOptions;
  suppliers?: SuppliersModuleOptions;
  users?: UsersModuleOptions;
  clientes?: ClientesModuleOptions;
  permissions?: PermissionsModuleOptions;
  organizationalStructure?: OrganizationalStructureModuleOptions;
  realtime?: { enabled?: boolean };
  company?: Parameters<typeof registerCompanySettingsModule>[1];
  notifications?: NotificationsModuleOptions;
  organizations?: OrganizationsModuleOptions;
  auth?: AuthModuleOptions;
  coreAuth?: CoreAuthModuleOptions;
};

export async function registerHttp(app: FastifyInstance, options: HttpModulesOptions = {}) {
  app.get("/health", async () => ({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  }));

  // Registrar módulo de autenticação (login/register) primeiro
  await registerAuthModule(app, options.auth);

  // Registrar módulo de organizações primeiro para obter organizationRepository
  const organizationsResult = await registerOrganizationsModule(app, options.organizations);
  const organizationRepository = organizationsResult?.organizationRepository;

  // Registrar middleware JWT global (sempre habilitado para suportar tenant via JWT)
  // O tenant middleware pode usar request.auth quando disponível, mas também funciona com headers diretos
  await registerCoreAuthModule(
    app,
    options.coreAuth ?? {
      excludeRoutes: ["/health", "/auth/login", "/auth/register", "/realtime/token"],
    },
  );
  await registerCatalogoModule(app, { ...options.catalogo, organizationRepository });
  const prefichaResult = await registerPrefichaModule(app, {
    ...options.preficha,
    organizationRepository,
  });

  await registerSuppliersModule(app, {
    ...options.suppliers,
    organizationRepository,
  });

  await registerUsersModule(app, options.users);

  await registerClientesModule(app, {
    ...options.clientes,
    organizationRepository,
  });

  // Registrar módulo de estrutura organizacional primeiro para ter acesso aos repositórios
  const organizationalStructureResult = await registerOrganizationalStructureModule(app, {
    ...options.organizationalStructure,
    organizationRepository,
  });

  // Registrar módulo de permissões com repositórios da estrutura organizacional
  await registerPermissionsModule(app, {
    ...options.permissions,
    organizationRepository,
    positionRepository: organizationalStructureResult?.positionRepository,
    sectorRepository: organizationalStructureResult?.sectorRepository,
    departmentRepository: organizationalStructureResult?.departmentRepository,
    positionMembershipRepository: organizationalStructureResult?.positionMembershipRepository,
    departmentMembershipRepository: organizationalStructureResult?.departmentMembershipRepository,
  });

  if (options.realtime?.enabled ?? true) {
    await registerRealtimeRoutes(app);
  }

  await registerNotificationsModule(app, {
    ...options.notifications,
    prefichaRepository: prefichaResult?.prefichaRepository,
    prefichaAuditoriaRepository: prefichaResult?.auditoriaRepository,
  });
  await registerCompanySettingsModule(app, options.company);
}
