/**
 * Página de Auditoria de Permissões
 * 
 * Dashboard para executar auditorias, visualizar anomalias
 * e aplicar correções no sistema de permissões.
 */

import { PermissionAuditDashboard } from "@/components/permissions/PermissionAuditDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auditoria de Permissões | MorinaLight",
    description: "Execute auditorias de permissões e identifique anomalias no sistema",
};

export default function PermissionAuditPage() {
    return (
        <div className="flex flex-col gap-6">
            <PermissionAuditDashboard />
        </div>
    );
}
