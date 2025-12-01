import { Branch } from "../entities/branch";

export interface BranchRepository {
    save(branch: Branch): Promise<void>;
    findById(id: string): Promise<Branch | null>;
    findByOrgId(orgId: string): Promise<Branch[]>;
    delete(id: string): Promise<void>;
}
