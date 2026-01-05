import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import type { AuditReport } from '../domain/types/audit-types';

interface AuditUpdate {
    type: 'progress' | 'completed' | 'failed' | 'anomaly_detected';
    orgId: string;
    data: any;
    timestamp: Date;
}

/**
 * Gateway WebSocket para atualizações em tempo real
 * Permite dashboard receber updates instantâneos
 */
@WebSocketGateway({
    namespace: '/audit',
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})
@Injectable()
export class AuditRealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, Set<string>>(); // orgId -> Set<socketId>

    /**
     * Cliente conectado
     */
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        // Extrair orgId do handshake
        const orgId = client.handshake.query.orgId as string;

        if (orgId) {
            if (!this.connectedClients.has(orgId)) {
                this.connectedClients.set(orgId, new Set());
            }
            this.connectedClients.get(orgId)!.add(client.id);

            // Juntar sala da organização
            client.join(`org:${orgId}`);
        }
    }

    /**
     * Cliente desconectado
     */
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        // Remover de todas as organizações
        for (const [orgId, clients] of this.connectedClients.entries()) {
            if (clients.has(client.id)) {
                clients.delete(client.id);
                if (clients.size === 0) {
                    this.connectedClients.delete(orgId);
                }
            }
        }
    }

    /**
     * Cliente se inscreve em atualizações de uma organização
     */
    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, orgId: string) {
        client.join(`org:${orgId}`);

        if (!this.connectedClients.has(orgId)) {
            this.connectedClients.set(orgId, new Set());
        }
        this.connectedClients.get(orgId)!.add(client.id);

        return { success: true, message: `Subscribed to org ${orgId}` };
    }

    /**
     * Cliente cancela inscrição
     */
    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(client: Socket, orgId: string) {
        client.leave(`org:${orgId}`);

        const clients = this.connectedClients.get(orgId);
        if (clients) {
            clients.delete(client.id);
            if (clients.size === 0) {
                this.connectedClients.delete(orgId);
            }
        }

        return { success: true, message: `Unsubscribed from org ${orgId}` };
    }

    /**
     * Envia atualização de progresso
     */
    sendProgress(orgId: string, progress: number, message?: string) {
        const update: AuditUpdate = {
            type: 'progress',
            orgId,
            data: { progress, message },
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('audit:progress', update);
    }

    /**
     * Envia auditoria completa
     */
    sendAuditCompleted(orgId: string, report: AuditReport) {
        const update: AuditUpdate = {
            type: 'completed',
            orgId,
            data: {
                reportId: report.id,
                summary: report.summary,
                anomaliesFound: report.summary.anomaliesFound,
                conformityScore: report.summary.conformityScore,
            },
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('audit:completed', update);
    }

    /**
     * Envia falha de auditoria
     */
    sendAuditFailed(orgId: string, error: string) {
        const update: AuditUpdate = {
            type: 'failed',
            orgId,
            data: { error },
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('audit:failed', update);
    }

    /**
     * Envia anomalia detectada em tempo real
     */
    sendAnomalyDetected(orgId: string, anomaly: any) {
        const update: AuditUpdate = {
            type: 'anomaly_detected',
            orgId,
            data: anomaly,
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('audit:anomaly', update);
    }

    /**
     * Broadcast para todos os clientes
     */
    broadcast(event: string, data: any) {
        this.server.emit(event, data);
    }

    /**
     * Obtém número de clientes conectados
     */
    getConnectedClientsCount(orgId?: string): number {
        if (orgId) {
            return this.connectedClients.get(orgId)?.size || 0;
        }

        let total = 0;
        for (const clients of this.connectedClients.values()) {
            total += clients.size;
        }
        return total;
    }

    /**
     * Obtém estatísticas de conexões
     */
    getConnectionStats(): {
        totalClients: number;
        organizationsConnected: number;
        clientsByOrg: Record<string, number>;
    } {
        const clientsByOrg: Record<string, number> = {};

        for (const [orgId, clients] of this.connectedClients.entries()) {
            clientsByOrg[orgId] = clients.size;
        }

        return {
            totalClients: this.getConnectedClientsCount(),
            organizationsConnected: this.connectedClients.size,
            clientsByOrg,
        };
    }
}
