/**
 * Dependency Injection Container
 * 
 * A simple DI container to manage service dependencies and singletons.
 * Promotes Dependency Inversion and decoupling.
 */

type Factory<T> = () => T;

export class Container {
    private static instance: Container;
    private services = new Map<string, any>();
    private factories = new Map<string, Factory<any>>();

    private constructor() { }

    public static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    /**
     * Register a singleton service
     */
    register<T>(key: string, instance: T): void {
        this.services.set(key, instance);
    }

    /**
     * Register a factory for transient instances
     */
    registerFactory<T>(key: string, factory: Factory<T>): void {
        this.factories.set(key, factory);
    }

    /**
     * Resolve a dependency
     */
    resolve<T>(key: string): T {
        if (this.services.has(key)) {
            return this.services.get(key);
        }

        if (this.factories.has(key)) {
            return this.factories.get(key)!();
        }

        throw new Error(`Service not found: ${key}`);
    }

    /**
     * Check if a service is registered
     */
    has(key: string): boolean {
        return this.services.has(key) || this.factories.has(key);
    }

    /**
     * Clear all services (useful for testing)
     */
    clear(): void {
        this.services.clear();
        this.factories.clear();
    }
}

export const container = Container.getInstance();
