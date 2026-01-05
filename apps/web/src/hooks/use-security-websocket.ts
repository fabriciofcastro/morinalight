"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SecurityEvent {
    type: 'session_created' | 'session_ended' | 'alert_created' | 'access_denied' | 'anomaly_detected' | 'high_risk_access';
    data: any;
    timestamp: Date;
}

interface UseSecurityWebSocketOptions {
    orgId: string;
    onEvent?: (event: SecurityEvent) => void;
    onStatsUpdate?: (stats: any) => void;
    autoConnect?: boolean;
}

/**
 * Hook para conexão WebSocket de segurança
 */
export function useSecurityWebSocket({
    orgId,
    onEvent,
    onStatsUpdate,
    autoConnect = true,
}: UseSecurityWebSocketOptions) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Conecta ao WebSocket
    const connect = useCallback(() => {
        if (socketRef.current?.connected) {
            return;
        }

        const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('[WebSocket] Conectado');
            setConnected(true);

            // Inscreve na organização
            newSocket.emit('subscribe:org', orgId);
        });

        newSocket.on('disconnect', () => {
            console.log('[WebSocket] Desconectado');
            setConnected(false);
        });

        newSocket.on('security:event', (event: SecurityEvent) => {
            console.log('[WebSocket] Evento recebido:', event);
            setEvents(prev => [event, ...prev].slice(0, 100)); // Mantém últimos 100
            onEvent?.(event);
        });

        newSocket.on('stats:update', (stats: any) => {
            console.log('[WebSocket] Stats atualizadas:', stats);
            onStatsUpdate?.(stats);
        });

        newSocket.on('stats:initial', (stats: any) => {
            console.log('[WebSocket] Stats iniciais:', stats);
            onStatsUpdate?.(stats);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    }, [orgId, onEvent, onStatsUpdate]);

    // Desconecta do WebSocket
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('unsubscribe:org', orgId);
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setConnected(false);
        }
    }, [orgId]);

    // Auto-conecta se habilitado
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    // Limpa eventos
    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    return {
        socket,
        connected,
        events,
        connect,
        disconnect,
        clearEvents,
    };
}

/**
 * Hook simplificado para monitoramento de eventos
 */
export function useSecurityEvents(orgId: string) {
    const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
    const [stats, setStats] = useState<any>(null);

    const handleEvent = useCallback((event: SecurityEvent) => {
        setRecentEvents(prev => [event, ...prev].slice(0, 50));
    }, []);

    const handleStatsUpdate = useCallback((newStats: any) => {
        setStats(newStats);
    }, []);

    const { connected, clearEvents } = useSecurityWebSocket({
        orgId,
        onEvent: handleEvent,
        onStatsUpdate: handleStatsUpdate,
    });

    return {
        connected,
        recentEvents,
        stats,
        clearEvents,
    };
}
