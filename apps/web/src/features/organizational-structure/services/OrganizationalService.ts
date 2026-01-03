import {
    HttpDepartmentRepository
} from "../repositories/HttpDepartmentRepository";
import {
    HttpSectorRepository
} from "../repositories/HttpSectorRepository";
import {
    HttpPositionRepository
} from "../repositories/HttpPositionRepository";
import {
    HttpSubdepartmentRepository
} from "../repositories/HttpSubdepartmentRepository";
import {
    GetOrganizationalTree,
    CreateDepartment,
    UpdateDepartment,
    DeleteDepartment,
    CreateSector,
    UpdateSector,
    DeleteSector,
    CreatePosition,
    UpdatePosition,
    DeletePosition,
    MoveDepartment,
    MoveSector
} from "@morina/organizational-structure-domain";

class OrganizationalService {
    private deptRepo = new HttpDepartmentRepository();
    private sectorRepo = new HttpSectorRepository();
    private positionRepo = new HttpPositionRepository();
    private subdeptRepo = new HttpSubdepartmentRepository();

    public getTree = new GetOrganizationalTree(
        this.deptRepo,
        this.subdeptRepo,
        this.sectorRepo,
        this.positionRepo
    );

    public createDepartment = new CreateDepartment(this.deptRepo);
    public updateDepartment = new UpdateDepartment(this.deptRepo);
    public deleteDepartment = new DeleteDepartment(this.deptRepo);

    public createSector = new CreateSector(this.sectorRepo);
    public updateSector = new UpdateSector(this.sectorRepo);
    public deleteSector = new DeleteSector(this.sectorRepo);

    public createPosition = new CreatePosition(this.positionRepo);
    public updatePosition = new UpdatePosition(this.positionRepo);
    public deletePosition = new DeletePosition(this.positionRepo);

    public moveDepartment = new MoveDepartment(this.deptRepo);
    public moveSector = new MoveSector(this.sectorRepo);

    // Direct repo access for simple lists
    public getDepartments = () => this.deptRepo.findAll();
    public getSectors = () => this.sectorRepo.findAll();
    public getPositions = () => this.positionRepo.findAll();
    public getSubdepartments = () => this.subdeptRepo.findAll();
}

export const organizationalService = new OrganizationalService();
