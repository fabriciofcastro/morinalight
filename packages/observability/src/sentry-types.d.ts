export interface SentryConfig {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    release?: string;
    dist?: string;
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
