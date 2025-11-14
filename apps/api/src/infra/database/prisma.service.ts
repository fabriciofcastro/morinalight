import { PrismaClient } from "@prisma/client";
import { env } from "../../core/config/env";

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    const prismaOptions: any = {
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    };

    // Configure read replica if available
    if (process.env.DATABASE_REPLICA_URL) {
      prismaOptions.datasources = {
        db: {
          url: env.DATABASE_URL,
        },
      };
      // Prisma doesn't natively support read replicas in the same client,
      // but we can use connection pooling or separate clients
      // For now, we'll use the main connection and optimize at query level
    }

    prisma = new PrismaClient(prismaOptions);
  }

  return prisma;
}

// Separate Prisma client for read operations (replica)
let prismaRead: PrismaClient | null = null;

export function getPrismaRead() {
  if (!prismaRead) {
    const replicaUrl = process.env.DATABASE_REPLICA_URL || env.DATABASE_URL;

    prismaRead = new PrismaClient({
      datasources: {
        db: {
          url: replicaUrl,
        },
      },
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  return prismaRead;
}

// Cleanup function
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
  if (prismaRead) {
    await prismaRead.$disconnect();
    prismaRead = null;
  }
}
