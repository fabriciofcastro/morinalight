export interface SoDPolicy {
    id: string;
    orgId: string;
    name: string;
    description: string;
    conflictingPermissions: string[][]; // Array de pares/grupos conflitantes
    severity: "low" | "medium" | "high" | "critical";
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SoDViolation {
    policyId: string;
    policyName: string;
    userId: string;
    userEmail: string;
    conflictingPermissions: string[];
    severity: "low" | "medium" | "high" | "critical";
    detectedAt: Date;
}

export const PRE_DEFINED_POLICIES: Omit<SoDPolicy, "id" | "orgId" | "createdAt" | "updatedAt">[] = [
    {
        name: "Segregação Financeira - Pagamentos",
        description: "Impede que o mesmo usuário crie E aprove pagamentos",
        conflictingPermissions: [
            ["payments.create", "payments.approve"],
            ["payments.create", "payments.execute"],
        ],
        severity: "critical",
        active: true,
    },
    {
        name: "Segregação RH - Gestão de Funcionários",
        description: "Impede que o mesmo usuário crie E aprove novos funcionários",
        conflictingPermissions: [
            ["employees.create", "employees.approve"],
            ["employees.create", "employees.salary.set"],
        ],
        severity: "high",
        active: true,
    },
    {
        name: "Segregação TI - Deploy e Aprovação",
        description: "Impede que o mesmo usuário faça deploy E aprove mudanças em produção",
        conflictingPermissions: [
            ["deployments.execute", "deployments.approve"],
            ["code.deploy", "code.review.approve"],
        ],
        severity: "high",
        active: true,
    },
    {
        name: "Segregação Compliance - Auditoria",
        description: "Impede que o mesmo usuário audite E modifique logs de auditoria",
        conflictingPermissions: [
            ["audit.view", "audit.modify"],
            ["audit.view", "audit.delete"],
            ["logs.view", "logs.modify"],
        ],
        severity: "critical",
        active: true,
    },
    {
        name: "Segregação Vendas - Desconto e Aprovação",
        description: "Impede que o mesmo usuário aplique E aprove descontos",
        conflictingPermissions: [
            ["sales.discount.apply", "sales.discount.approve"],
            ["sales.price.override", "sales.price.approve"],
        ],
        severity: "medium",
        active: true,
    },
    {
        name: "Segregação Compras - Requisição e Aprovação",
        description: "Impede que o mesmo usuário requisite E aprove compras",
        conflictingPermissions: [
            ["purchases.request", "purchases.approve"],
            ["purchases.request", "purchases.execute"],
        ],
        severity: "high",
        active: true,
    },
];
