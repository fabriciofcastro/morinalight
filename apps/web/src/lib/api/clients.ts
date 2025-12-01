import { apiClient } from './base';

export interface Client {
    clienteId: string;
    nome: string;
    email?: string;
    telefone?: string;
    documento?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface Representative {
    representanteId: string;
    nome: string;
    email: string;
    telefone?: string;
    comissaoPadrao: number;
    status: 'active' | 'inactive';
}

export interface Commission {
    comissaoId: string;
    representanteId: string;
    representanteNome: string;
    clienteId?: string;
    clienteNome?: string;
    valorVenda: number;
    valorComissao: number;
    percentual: number;
    status: 'aguardando' | 'em_analise' | 'aprovada' | 'contestada' | 'cancelada' | 'paga';
    mesCompetencia: string;
    dataLancamento: string;
    romaneio?: string;
}

export class ClientsApi {
    async listClients(): Promise<Client[]> {
        return apiClient.get<Client[]>('/clientes');
    }

    async listRepresentatives(): Promise<Representative[]> {
        return apiClient.get<Representative[]>('/representantes');
    }

    async listCommissions(): Promise<Commission[]> {
        return apiClient.get<Commission[]>('/comissoes');
    }
}

export const clientsApi = new ClientsApi();
