import type { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

export async function getPrismaClient(): Promise<PrismaClient | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  // Se não há banco configurado, não tentar Prisma (evita erro ruidoso e deixa fallback trabalhar).
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    const { createEncryptionMiddleware } = await import("./crypto/prisma-encryption-middleware");

    prismaInstance =
      global.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });

    // Ativar middleware de criptografia
    prismaInstance.$use(createEncryptionMiddleware());

    if (process.env.NODE_ENV !== "production") {
      global.prisma = prismaInstance;
    }

    return prismaInstance;
  } catch (error) {
    console.warn("[theme-engine] Prisma client indisponível, usando fallback em memória.", error);
    return null;
  }
}

export async function getRawPrismaClient(): Promise<PrismaClient | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    return new PrismaClient();
  } catch (error) {
    return null;
  }
}
