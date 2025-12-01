import type { BusinessSegment } from "../entities/business-segment";

export type BusinessSegmentFiltro = {
    orgId: string;
    busca?: string;
    active?: boolean;
};

export interface BusinessSegmentRepository {
    save(businessSegment: BusinessSegment): Promise<void>;
    findById(id: string): Promise<BusinessSegment | null>;
    findAll(filtro: BusinessSegmentFiltro): Promise<BusinessSegment[]>;
    delete(id: string): Promise<void>;
}
