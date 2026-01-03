export enum BranchType {
    MATRIZ = "matriz",
    FILIAL = "filial",
    CD = "centro_distribuicao",
    LOJA = "loja",
    ESCRITORIO = "escritorio",
}

export const BRANCH_TYPE_LABELS: Record<BranchType, string> = {
    [BranchType.MATRIZ]: "Matriz",
    [BranchType.FILIAL]: "Filial",
    [BranchType.CD]: "Centro de Distribuição",
    [BranchType.LOJA]: "Loja",
    [BranchType.ESCRITORIO]: "Escritório",
};

export const BRANCH_TYPE_DESCRIPTIONS: Record<BranchType, string> = {
    [BranchType.MATRIZ]: "Sede principal da empresa",
    [BranchType.FILIAL]: "Unidade secundária da empresa",
    [BranchType.CD]: "Centro de distribuição e logística",
    [BranchType.LOJA]: "Ponto de venda ao consumidor",
    [BranchType.ESCRITORIO]: "Escritório administrativo",
};

export interface BranchHierarchy {
    id: string;
    name: string;
    code: string;
    type: BranchType;
    parentId?: string;
    level: number; // 0 = Matriz, 1 = Filial direta, 2 = Sub-filial, etc.
    children?: BranchHierarchy[];
    active: boolean;
}

export interface BranchHierarchyNode extends BranchHierarchy {
    parent?: BranchHierarchyNode;
    childrenCount: number;
    path: string[]; // Array de IDs do caminho até esse nó
}

export const MAX_HIERARCHY_LEVELS = 4;

// Validações de hierarquia
export function canHaveParent(type: BranchType): boolean {
    // Matriz não pode ter pai
    return type !== BranchType.MATRIZ;
}

export function canHaveChildren(type: BranchType): boolean {
    // Todos os tipos podem ter filhos, exceto talvez lojas (depende da regra de negócio)
    return true;
}

export function validateHierarchy(
    type: BranchType,
    parentId?: string,
    parentType?: BranchType
): { valid: boolean; error?: string } {
    // Matriz não pode ter pai
    if (type === BranchType.MATRIZ && parentId) {
        return {
            valid: false,
            error: "A Matriz não pode ter uma filial pai",
        };
    }

    // Outros tipos devem ter pai (exceto se for a primeira filial)
    if (type !== BranchType.MATRIZ && !parentId) {
        // Permitir criar sem pai por enquanto
        return { valid: true };
    }

    // Validar se o tipo do pai é compatível
    if (parentType === BranchType.LOJA) {
        return {
            valid: false,
            error: "Uma Loja não pode ter filiais subordinadas",
        };
    }

    return { valid: true };
}
