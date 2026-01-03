export interface SentryConfig {
    dsn: string;
    environment: string;
    // Performance Monitoring
    tracesSampleRate: number;
    // Session Replay
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    // Configuração Enterprise
    release?: string;
    dist?: string;
    // Feature Flags
    enabled: boolean;
    debug?: boolean;
}

export interface UserContext {
    id: string;
    email?: string;
    username?: string;
    role?: string;
    ip_address?: string;
    [key: string]: any;
}

export interface CustomTags {
    feature?: string;
    service: "web" | "api" | "realtime";
    version?: string;
    [key: string]: string | undefined;
}
