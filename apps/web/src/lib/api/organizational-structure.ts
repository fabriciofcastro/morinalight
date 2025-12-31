import { apiClient as api } from "./base";

export interface Branch {
    id: string;
    name: string;
    type: string;
    code: string; // internalCode
    cnpj?: string;
    stateRegistration?: string;
    address?: {
        zipCode: string;
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    phone?: string;
    email?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBranchInput {
    name: string;
    type: string;
    code: string;
    cnpj?: string;
    stateRegistration?: string;
    address?: {
        zipCode: string;
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    phone?: string;
    email?: string;
    active?: boolean;
}

export interface UpdateBranchInput extends Partial<CreateBranchInput> {
    id: string;
}

export const organizationalStructureApi = {
    // ... (methods remain the same, they use the interfaces)
    // Branches
    getBranches: async () => {
        return api.get<Branch[]>("/branches");
    },

    getBranch: async (id: string) => {
        return api.get<Branch>(`/branches/${id}`);
    },

    createBranch: async (data: CreateBranchInput) => {
        return api.post<Branch>("/branches", data);
    },

    updateBranch: async (data: UpdateBranchInput) => {
        const { id, ...body } = data;
        return api.put<Branch>(`/branches/${id}`, body);
    },

    deleteBranch: async (id: string) => {
        return api.delete(`/branches/${id}`);
    },

    duplicateBranch: async (
        id: string,
        options: {
            name: string;
            code: string;
            copyDocuments?: boolean;
            copyBusinessHours?: boolean;
            maintainHierarchy?: boolean;
        }
    ) => {
        return api.post<Branch>(`/branches/${id}/duplicate`, options);
    },

    // Departments
    getDepartments: async () => {
        return api.get<Department[]>("/departments");
    },

    getDepartment: async (id: string) => {
        return api.get<Department>(`/departments/${id}`);
    },

    createDepartment: async (data: CreateDepartmentInput) => {
        return api.post<Department>("/departments", data);
    },

    updateDepartment: async (data: UpdateDepartmentInput) => {
        const { id, ...body } = data;
        return api.put<Department>(`/departments/${id}`, body);
    },

    deleteDepartment: async (id: string) => {
        return api.delete(`/departments/${id}`);
    },

    // Subdepartments
    getSubdepartments: async (params?: { orgId?: string; departmentId?: string; status?: string; busca?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.orgId) queryParams.append("orgId", params.orgId);
        if (params?.departmentId) queryParams.append("departmentId", params.departmentId);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.busca) queryParams.append("busca", params.busca);
        const query = queryParams.toString();
        return api.get<{ itens: Subdepartment[]; proximoCursor?: string | null }>(`/subdepartments${query ? `?${query}` : ""}`);
    },

    getSubdepartment: async (id: string) => {
        return api.get<Subdepartment>(`/subdepartments/${id}`);
    },

    createSubdepartment: async (data: CreateSubdepartmentInput & { orgId: string }) => {
        return api.post<Subdepartment>("/subdepartments", data);
    },

    updateSubdepartment: async (data: UpdateSubdepartmentInput & { orgId: string }) => {
        const { subdepartmentId, orgId, ...body } = data;
        return api.put<Subdepartment>(`/subdepartments/${subdepartmentId}`, { ...body, orgId });
    },

    deleteSubdepartment: async (id: string) => {
        return api.delete(`/subdepartments/${id}`);
    },

    // Sectors
    getSectors: async (params?: { orgId?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.orgId) queryParams.append("orgId", params.orgId);
        const query = queryParams.toString();
        return api.get<Sector[]>(`/sectors${query ? `?${query}` : ""}`);
    },

    getSector: async (id: string) => {
        return api.get<Sector>(`/sectors/${id}`);
    },

    createSector: async (data: CreateSectorInput) => {
        return api.post<Sector>("/sectors", data);
    },

    updateSector: async (data: UpdateSectorInput) => {
        const { id, ...body } = data;
        return api.put<Sector>(`/sectors/${id}`, body);
    },

    deleteSector: async (id: string) => {
        return api.delete(`/sectors/${id}`);
    },

    // Positions
    getPositions: async () => {
        return api.get<Position[]>("/positions");
    },

    getPosition: async (id: string) => {
        return api.get<Position>(`/positions/${id}`);
    },

    createPosition: async (data: CreatePositionInput) => {
        return api.post<Position>("/positions", data);
    },

    updatePosition: async (data: UpdatePositionInput) => {
        const { id, ...body } = data;
        return api.put<Position>(`/positions/${id}`, body);
    },

    deletePosition: async (id: string) => {
        return api.delete(`/positions/${id}`);
    },

    // Business Segments
    getBusinessSegments: async () => {
        return api.get<BusinessSegment[]>("/business-segments");
    },

    getBusinessSegment: async (id: string) => {
        return api.get<BusinessSegment>(`/business-segments/${id}`);
    },

    createBusinessSegment: async (data: CreateBusinessSegmentInput) => {
        return api.post<BusinessSegment>("/business-segments", data);
    },

    updateBusinessSegment: async (data: UpdateBusinessSegmentInput) => {
        const { id, ...body } = data;
        return api.put<BusinessSegment>(`/business-segments/${id}`, body);
    },

    deleteBusinessSegment: async (id: string) => {
        return api.delete(`/business-segments/${id}`);
    },

    // Workflow Policies
    getWorkflowPolicies: async () => {
        return api.get<WorkflowPolicy[]>("/workflow-policies");
    },

    getWorkflowPolicy: async (id: string) => {
        return api.get<WorkflowPolicy>(`/workflow-policies/${id}`);
    },

    createWorkflowPolicy: async (data: CreateWorkflowPolicyInput) => {
        return api.post<WorkflowPolicy>("/workflow-policies", data);
    },

    updateWorkflowPolicy: async (data: UpdateWorkflowPolicyInput) => {
        const { id, ...body } = data;
        return api.put<WorkflowPolicy>(`/workflow-policies/${id}`, body);
    },

    deleteWorkflowPolicy: async (id: string) => {
        return api.delete(`/workflow-policies/${id}`);
    },
};

export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    type: string;
    active: boolean;
    filialId?: string;
    parentId?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentInput {
    name: string;
    code: string;
    description?: string;
    type: string;
    active?: boolean;
    filialId?: string;
    parentId?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
    id: string;
}

export interface Subdepartment {
    subdepartmentId: string;
    orgId: string;
    departmentId: string;
    name: string;
    code: string;
    description?: string | null;
    parentId?: string | null;
    status: "ativo" | "inativo" | "arquivado";
    ordem: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubdepartmentInput {
    name: string;
    code: string;
    description?: string;
    departmentId: string;
    parentId?: string;
    status?: "ativo" | "inativo" | "arquivado";
    ordem?: number;
}

export interface UpdateSubdepartmentInput extends Partial<CreateSubdepartmentInput> {
    subdepartmentId: string;
}

export interface Sector {
    id: string;
    name: string;
    code: string;
    description?: string;
    type: string;
    active: boolean;
    departmentId: string;
    filialId?: string;
    parentId?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSectorInput {
    name: string;
    code: string;
    description?: string;
    type: string;
    active?: boolean;
    departmentId: string;
    filialId?: string;
    parentId?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateSectorInput extends Partial<CreateSectorInput> {
    id: string;
}

export interface Position {
    id: string;
    name: string;
    code: string;
    description?: string;
    seniority: string;
    baseSalary?: number;
    active: boolean;
    responsabilidades?: string;
    requisitos?: string;
    salarioMin?: number;
    salarioMax?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePositionInput {
    name: string;
    code: string;
    description?: string;
    seniority: string;
    baseSalary?: number;
    active?: boolean;
    responsabilidades?: string;
    requisitos?: string;
    salarioMin?: number;
    salarioMax?: number;
}

export interface UpdatePositionInput extends Partial<CreatePositionInput> {
    id: string;
}

// Business Segments
export interface BusinessSegment {
    id: string;
    code: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBusinessSegmentInput {
    code: string;
    description: string;
    active?: boolean;
}

export interface UpdateBusinessSegmentInput extends Partial<CreateBusinessSegmentInput> {
    id: string;
}

// Workflow Policies
export interface WorkflowPolicy {
    id: string;
    module: string;
    flowType: string;
    config: Record<string, unknown>;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkflowPolicyInput {
    module: string;
    flowType: string;
    config: Record<string, unknown>;
    active?: boolean;
}

export interface UpdateWorkflowPolicyInput extends Partial<CreateWorkflowPolicyInput> {
    id: string;
}


