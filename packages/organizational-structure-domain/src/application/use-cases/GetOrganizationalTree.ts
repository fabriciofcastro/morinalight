import { IDepartmentRepository } from "../../entities/repositories/IDepartmentRepository";
import { ISectorRepository } from "../../entities/repositories/ISectorRepository";
import { IPositionRepository } from "../../entities/repositories/IPositionRepository";
import { ISubdepartmentRepository } from "../../entities/repositories/ISubdepartmentRepository";

export interface TreeNode {
    id: string;
    type: "department" | "subdepartment" | "sector" | "position";
    name: string;
    code: string;
    active: boolean;
    children: TreeNode[];
    data: any;
}

export class GetOrganizationalTree {
    constructor(
        private departmentRepo: IDepartmentRepository,
        private subdepartmentRepo: ISubdepartmentRepository,
        private sectorRepo: ISectorRepository,
        private positionRepo: IPositionRepository
    ) { }

    async execute(): Promise<TreeNode[]> {
        const [departments, subdepartments, sectors, positions] = await Promise.all([
            this.departmentRepo.findAll(),
            this.subdepartmentRepo.findAll(),
            this.sectorRepo.findAll(),
            this.positionRepo.findAll(),
        ]);

        // Build hierarchy
        // Simplified version: 1st level = Top Level Departments
        const tree: TreeNode[] = [];

        // Map departments by ID
        const deptMap = new Map<string, TreeNode>();
        departments.forEach((d) => {
            const nodeId = d.id || "";
            const node: TreeNode = {
                id: nodeId,
                type: "department",
                name: d.name,
                code: d.code,
                active: d.active,
                children: [],
                data: d,
            };
            deptMap.set(nodeId, node);
        });

        // Map subdepartments and sectors to departments
        subdepartments.forEach((sd) => {
            const parent = deptMap.get(sd.departmentId);
            if (parent) {
                const node: TreeNode = {
                    id: sd.subdepartmentId || "",
                    type: "subdepartment",
                    name: sd.name,
                    code: sd.code,
                    active: sd.status === "ativo",
                    children: [],
                    data: sd,
                };
                parent.children.push(node);
            }
        });

        sectors.forEach((s) => {
            const parentId = s.parentId || s.departmentId;
            const parent = deptMap.get(parentId || "");
            if (parent) {
                const node: TreeNode = {
                    id: s.id || "",
                    type: "sector",
                    name: s.name,
                    code: s.code,
                    active: s.active,
                    children: [],
                    data: s,
                };
                parent.children.push(node);
            }
        });

        // Handle positions
        positions.forEach((p) => {
            // Placeholder: positions belong to sectors. 
            // In a real implementation we would search for the sector node in the tree.
        });

        departments.forEach(d => {
            const nodeId = d.id || "";
            if (!d.parentId) {
                const node = deptMap.get(nodeId);
                if (node) tree.push(node);
            } else {
                const parent = deptMap.get(d.parentId);
                if (parent) {
                    const node = deptMap.get(nodeId);
                    if (node) parent.children.push(node);
                }
            }
        });

        return tree;
    }
}
