import { getPrisma } from "../../infra/database/prisma.service";
import type { IntegrationConnector } from "./connectors/base-connector";
import { MockConnector } from "./connectors/mock-connector";

const prisma = getPrisma();

export class ConnectorManager {
  /**
   * Get connector instance by connection ID
   */
  async getConnector(connectionId: string): Promise<IntegrationConnector | null> {
    const connection = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || !connection.isActive) {
      return null;
    }

    return this.createConnectorInstance(
      connection.id,
      connection.connectorType,
      connection.credentials as any,
      connection.config as any,
    );
  }

  /**
   * Create connector instance based on type
   */
  private createConnectorInstance(
    connectionId: string,
    type: string,
    credentials: any,
    config: any,
  ): IntegrationConnector {
    switch (type) {
      case "mock":
        return new MockConnector(connectionId, credentials, config);

      // Add more connectors here
      // case 'mercadolivre':
      //   return new MercadoLivreConnector(connectionId, credentials, config);

      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  }

  /**
   * Execute sync and log results
   */
  async executeSync(connectionId: string, syncType: "products" | "orders" | "customers") {
    const connector = await this.getConnector(connectionId);
    if (!connector) {
      throw new Error("Connector not found or inactive");
    }

    let result;

    switch (syncType) {
      case "products":
        result = await connector.syncProducts();
        break;
      case "orders":
        if (connector.syncOrders) {
          result = await connector.syncOrders();
        } else {
          throw new Error("This connector does not support order sync");
        }
        break;
      case "customers":
        if (connector.syncCustomers) {
          result = await connector.syncCustomers();
        } else {
          throw new Error("This connector does not support customer sync");
        }
        break;
      default:
        throw new Error(`Unknown sync type: ${syncType}`);
    }

    // Log the sync
    await prisma.integrationSyncLog.create({
      data: {
        connectionId,
        syncType,
        status: result.success ? "success" : "error",
        itemsProcessed: result.itemsProcessed,
        itemsSuccess: result.itemsSuccess,
        itemsFailed: result.itemsFailed,
        errors: result.errors ? JSON.stringify(result.errors) : null,
        durationMs: result.durationMs,
      },
    });

    // Update last sync time
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    return result;
  }

  /**
   * Test connection
   */
  async testConnection(connectionId: string): Promise<boolean> {
    const connector = await this.getConnector(connectionId);
    if (!connector) {
      return false;
    }
    return connector.testConnection();
  }

  /**
   * List available connector types
   */
  getAvailableConnectors() {
    return [
      {
        type: "mock",
        name: "Mock Connector",
        description: "Conector de teste (não faz chamadas reais)",
        logo: "🧪",
        features: ["products", "orders"],
      },
      // Add more as they're implemented
      // {
      //   type: 'mercadolivre',
      //   name: 'Mercado Livre',
      //   description: 'Sincronize produtos e pedidos do Mercado Livre',
      //   logo: '🛒',
      //   features: ['products', 'orders']
      // }
    ];
  }
}

export const connectorManager = new ConnectorManager();
