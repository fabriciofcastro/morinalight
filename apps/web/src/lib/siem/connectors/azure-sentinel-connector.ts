export class AzureSentinelConnector {
    name = 'Azure Sentinel';
    async export() { return Promise.resolve(); }
    async isHealthy() { return Promise.resolve(true); }
}
