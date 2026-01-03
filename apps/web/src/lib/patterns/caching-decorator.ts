/**
 * Caching Decorator for Repositories
 * 
 * Implementa cache transparente usando Decorator Pattern.
 */

// Simple In-Memory Cache (pode ser substituído por Redis)
const cacheStorage = new Map<string, { data: any, expiresAt: number }>();

export interface CacheOptions {
    ttlSeconds: number;
    keyPrefix?: string;
}

/**
 * Decorator Factory
 */
export function Cached(options: CacheOptions) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;

        descriptor.value = async function (...args: any[]) {
            // 1. Gerar Key única baseada na classe, método e argumentos
            const argsKey = JSON.stringify(args);
            const prefix = options.keyPrefix || className;
            const cacheKey = `${prefix}:${propertyKey}:${argsKey}`;

            // 2. Verificar Cache
            const cached = cacheStorage.get(cacheKey);
            const now = Date.now();

            if (cached && cached.expiresAt > now) {
                console.log(`[Cache] Hit for ${cacheKey}`);
                return cached.data;
            }

            // 3. Executar método original
            console.log(`[Cache] Miss for ${cacheKey}, executing...`);
            const result = await originalMethod.apply(this, args);

            // 4. Salvar no Cache
            if (result !== null && result !== undefined) {
                cacheStorage.set(cacheKey, {
                    data: result,
                    expiresAt: now + (options.ttlSeconds * 1000)
                });
            }

            return result;
        };

        return descriptor;
    };
}

/**
 * Cache Invalidation Decorator
 * Limpa o cache quando métodos de escrita são chamados
 */
export function InvalidatesCache(prefix: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // Executa operação original (ex: update, create)
            const result = await originalMethod.apply(this, args);

            // Invalida chaves que começam com o prefixo
            console.log(`[Cache] Invalidating prefix ${prefix}*`);
            for (const key of cacheStorage.keys()) {
                if (key.startsWith(prefix)) {
                    cacheStorage.delete(key);
                }
            }

            return result;
        };

        return descriptor;
    };
}
