import type { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

export async function getPrismaClient(): Promise<PrismaClient | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    prismaInstance =
      global.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });

    if (process.env.NODE_ENV !== "production") {
      global.prisma = prismaInstance;
    }

    return prismaInstance;
  } catch (error) {
    console.warn("[theme-engine] Prisma client indisponível, usando fallback em memória.", error);
    return null;
  }
}
