export class DatadogConnector {
    name = 'Datadog';
    async export() { return Promise.resolve(); }
    async isHealthy() { return Promise.resolve(true); }
}
