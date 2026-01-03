/**
 * Optimized Database Connection Pool Configuration
 * Provides connection pooling management and monitoring
 */

import { Prisma } from "@prisma/client";
import { env } from "../config/env";

export interface ConnectionPoolConfig {
  maxConnections?: number;
  minConnections?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
  maxLifetime?: number;
}

const DEFAULT_CONFIG: Required<ConnectionPoolConfig> = {
  maxConnections: 20,
  minConnections: 2,
  connectionTimeout: 10000,
  idleTimeout: 600000, // 10 minutes
  maxLifetime: 3600000, // 1 hour
};

/**
 * Get optimized Prisma client options with connection pooling
 */
export function getPrismaClientOptions(config?: ConnectionPoolConfig): Prisma.PrismaClientOptions {
  const poolConfig = { ...DEFAULT_CONFIG, ...config };

  // Parse DATABASE_URL to add connection pool parameters
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  let connectionString = databaseUrl || "";

  // Add connection pool parameters to PostgreSQL URL
  if (connectionString.includes("postgresql://") || connectionString.includes("postgres://")) {
    const url = new URL(connectionString);
    
    // Connection pool parameters
    url.searchParams.set("connection_limit", String(poolConfig.maxConnections));
    url.searchParams.set("pool_timeout", String(poolConfig.connectionTimeout / 1000));
    url.searchParams.set("connect_timeout", "10");
    
    // PostgreSQL-specific optimizations
    url.searchParams.set("pgbouncer", "true"); // If using PgBouncer
    
    connectionString = url.toString();
  }

  return {
    log: env.NODE_ENV === "development" 
      ? ["query", "error", "warn", "info"]
      : ["error"],
    datasources: {
      db: {
        url: connectionString,
      },
    },
    // Connection pool configuration (Prisma uses connection pooling internally)
    // These are passed via connection string parameters
  };
}

/**
 * Monitor connection pool health
 */
export async function getConnectionPoolStats(prisma: Prisma.PrismaClient) {
  try {
    const [activeConnections, totalConnections, maxConnections] = await Promise.all([
      // Active connections
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database() 
        AND state = 'active'
      `,
      // Total connections
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `,
      // Max connections (from PostgreSQL settings)
      prisma.$queryRaw<Array<{ setting: string }>>`
        SELECT setting 
        FROM pg_settings 
        WHERE name = 'max_connections'
      `,
    ]);

    const active = Number(activeConnections[0]?.count || 0);
    const total = Number(totalConnections[0]?.count || 0);
    const max = Number(maxConnections[0]?.setting || 100);

    return {
      active,
      total,
      max,
      utilizationPercent: (total / max) * 100,
      idle: total - active,
    };
  } catch (error) {
    console.error("Failed to get connection pool stats:", error);
    return null;
  }
}

/**
 * Optimize connection pool for read replicas
 */
export function getReadReplicaOptions(replicaUrl?: string): Prisma.PrismaClientOptions {
  const connectionString = replicaUrl || env.DATABASE_REPLICA_URL || env.DATABASE_URL || "";

  // Read replicas typically handle more connections (read-only)
  const readPoolConfig = {
    ...DEFAULT_CONFIG,
    maxConnections: DEFAULT_CONFIG.maxConnections * 2, // More connections for reads
  };

  let optimizedUrl = connectionString;

  if (connectionString.includes("postgresql://") || connectionString.includes("postgres://")) {
    const url = new URL(connectionString);
    url.searchParams.set("connection_limit", String(readPoolConfig.maxConnections));
    url.searchParams.set("pool_timeout", String(readPoolConfig.connectionTimeout / 1000));
    optimizedUrl = url.toString();
  }

  return {
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: optimizedUrl,
      },
    },
  };
}











