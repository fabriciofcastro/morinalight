
export interface SyncResult {
    success: boolean;
    itemsProcessed: number;
    itemsSuccess: number;
    itemsFailed: number;
    errors?: Array<{ item: string; error: string }>;
    durationMs: number;
}

export interface ConnectorCredentials {
    [key: string]: any;
}

export interface ConnectorConfig {
    [key: string]: any;
}

/**
 * Base abstract class for all integration connectors
 * Implement this class to create new connectors (Mercado Livre, Shopify, etc)
 */
export abstract class IntegrationConnector {
    protected connectionId: string;
    protected credentials: ConnectorCredentials;
    protected config: ConnectorConfig;

    constructor(connectionId: string, credentials: ConnectorCredentials, config: ConnectorConfig = {}) {
        this.connectionId = connectionId;
        this.credentials = credentials;
        this.config = config;
    }

    /**
     * Test if the connection is valid
     */
    abstract testConnection(): Promise<boolean>;

    /**
     * Sync products from external platform to Morina
     */
    abstract syncProducts(): Promise<SyncResult>;

    /**
     * Sync orders from external platform to Morina (optional)
     */
    async syncOrders?(): Promise<SyncResult>;

    /**
     * Sync customers from external platform to Morina (optional)
     */
    async syncCustomers?(): Promise<SyncResult>;

    /**
     * Get connector display name
     */
    abstract getDisplayName(): string;

    /**
     * Get connector type identifier
     */
    abstract getType(): string;
}
