import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

/**
 * Eventos de segurança em tempo real
 */
export interface SecurityEvent {
    type: 'session_created' | 'session_ended' | 'alert_created' | 'access_denied' | 'anomaly_detected' | 'high_risk_access';
    data: any;
    timestamp: Date;
}

/**
 * SecurityMonitoringGateway
 * Gateway WebSocket para eventos de segurança em tempo real
 */
@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/security',
})
@Injectable()
export class SecurityMonitoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, Socket>();

    /**
     * Cliente conectado
     */
    handleConnection(client: Socket) {
        console.log(`[WebSocket] Cliente conectado: ${client.id}`);
        this.connectedClients.set(client.id, client);

        // Envia estatísticas iniciais
        this.sendInitialStats(client);
    }

    /**
     * Cliente desconectado
     */
    handleDisconnect(client: Socket) {
        console.log(`[WebSocket] Cliente desconectado: ${client.id}`);
        this.connectedClients.delete(client.id);
    }

    /**
     * Cliente se inscreve em eventos de uma organização
     */
    @SubscribeMessage('subscribe:org')
    handleSubscribeOrg(client: Socket, orgId: string) {
        client.join(`org:${orgId}`);
        console.log(`[WebSocket] Cliente ${client.id} inscrito em org:${orgId}`);
    }

    /**
     * Cliente se desinscreve de eventos de uma organização
     */
    @SubscribeMessage('unsubscribe:org')
    handleUnsubscribeOrg(client: Socket, orgId: string) {
        client.leave(`org:${orgId}`);
        console.log(`[WebSocket] Cliente ${client.id} desinscrito de org:${orgId}`);
    }

    /**
     * Envia estatísticas iniciais ao cliente
     */
    private async sendInitialStats(client: Socket) {
        // TODO: Buscar stats reais do banco
        const stats = {
            activeSessions: 0,
            activeAlerts: 0,
            recentAccesses: 0,
        };

        client.emit('stats:initial', stats);
    }

    /**
     * Emite evento de nova sessão criada
     */
    emitSessionCreated(orgId: string, session: any) {
        const event: SecurityEvent = {
            type: 'session_created',
            data: session,
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('security:event', event);
        console.log(`[WebSocket] Evento session_created emitido para org:${orgId}`);
    }

    /**
     * Emite evento de sessão encerrada
     */
    emitSessionEnded(orgId: string, sessionId: string) {
        const event: SecurityEvent = {
            type: 'session_ended',
            data: { sessionId },
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('security:event', event);
        console.log(`[WebSocket] Evento session_ended emitido para org:${orgId}`);
    }

    /**
     * Emite evento de novo alerta
     */
    emitAlertCreated(orgId: string, alert: any) {
        const event: SecurityEvent = {
            type: 'alert_created',
            data: alert,
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('security:event', event);
        console.log(`[WebSocket] Evento alert_created emitido para org:${orgId}`);
    }

    /**
     * Emite evento de acesso negado
     */
    emitAccessDenied(orgId: string, accessLog: any) {
        const event: SecurityEvent = {
            type: 'access_denied',
            data: accessLog,
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('security:event', event);
        console.log(`[WebSocket] Evento access_denied emitido para org:${orgId}`);
    }

    /**
     * Emite evento de anomalia detectada
     */
    emitAnomalyDetected(orgId: string, anomaly: any) {
        const event: SecurityEvent = {
            type: 'anomaly_detected',
            data: anomaly,
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('security:event', event);
        console.log(`[WebSocket] Evento anomaly_detected emitido para org:${orgId}`);
    }

    /**
     * Emite evento de acesso de alto risco
     */
    emitHighRiskAccess(orgId: string, accessLog: any) {
        const event: SecurityEvent = {
            type: 'high_risk_access',
            data: accessLog,
            timestamp: new Date(),
        };

        this.server.to(`org:${orgId}`).emit('security:event', event);
        console.log(`[WebSocket] Evento high_risk_access emitido para org:${orgId}`);
    }

    /**
     * Emite estatísticas atualizadas
     */
    emitStatsUpdate(orgId: string, stats: any) {
        this.server.to(`org:${orgId}`).emit('stats:update', stats);
    }

    /**
     * Broadcast para todos os clientes conectados
     */
    broadcastToAll(event: string, data: any) {
        this.server.emit(event, data);
    }

    /**
     * Obtém número de clientes conectados
     */
    getConnectedClientsCount(): number {
        return this.connectedClients.size;
    }
}
