import { GovernancePolicy } from "../types/policy.types";

export class RBACModule {
    /**
     * Verifica se o papel tem permissão para a tela.
     * Suporta wildcard '*' para acesso total.
     */
    static checkAccess(userRole: string, screenId: string, policy: GovernancePolicy): boolean {
        const roleConfig = policy.roles[userRole];

        // 1. Role não existe na política -> Bloqueio padrão (Fail-close)
        if (!roleConfig) {
            // TODO: Log warning "Unknown Role"
            return false;
        }

        // 2. Acesso Total (Diretor/Admin)
        if (roleConfig.allowed_screens.includes("*")) {
            return true;
        }

        // 3. Verificação explícita
        return roleConfig.allowed_screens.includes(screenId);
    }

    /**
     * (Opcional) Retorna flatten permissions para UI
     */
    static getPermissions(userRole: string, policy: GovernancePolicy): string[] {
        const roleConfig = policy.roles[userRole];
        if (!roleConfig) return [];
        return roleConfig.allowed_screens;
    }
}
