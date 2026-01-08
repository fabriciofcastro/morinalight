import { IntegrationConnector, type SyncResult } from "./base-connector";

/**
 * Mock connector for testing without real API calls
 * Simulates successful sync operations
 */
export class MockConnector extends IntegrationConnector {
  getDisplayName(): string {
    return "Mock Connector (Teste)";
  }

  getType(): string {
    return "mock";
  }

  async testConnection(): Promise<boolean> {
    // Simulate network delay
    await this.delay(500);
    return true;
  }

  async syncProducts(): Promise<SyncResult> {
    const startTime = Date.now();

    // Simulate processing
    await this.delay(1000);

    // Mock data
    const mockProducts = [
      { sku: "MOCK-001", name: "Produto Mock 1" },
      { sku: "MOCK-002", name: "Produto Mock 2" },
      { sku: "MOCK-003", name: "Produto Mock 3" },
    ];

    return {
      success: true,
      itemsProcessed: mockProducts.length,
      itemsSuccess: mockProducts.length,
      itemsFailed: 0,
      durationMs: Date.now() - startTime,
    };
  }

  async syncOrders(): Promise<SyncResult> {
    const startTime = Date.now();
    await this.delay(800);

    return {
      success: true,
      itemsProcessed: 5,
      itemsSuccess: 5,
      itemsFailed: 0,
      durationMs: Date.now() - startTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
