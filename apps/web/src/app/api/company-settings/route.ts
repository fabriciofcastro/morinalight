import { NextResponse } from "next/server";

import { apiUrl, defaultOrgId } from "@/lib/env";
import {
  type NormalizedCompanySettings,
  normalizeCompanySettings,
  sanitizeForPersistence,
} from "@/lib/company-settings";
import { getPrismaClient } from "@/lib/prisma";
import { companySettingsSchema } from "@/schemas/company-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MemoryStore = Map<string, NormalizedCompanySettings>;

declare global {
  var __companySettingsStore: MemoryStore | undefined;
}

const memoryStore: MemoryStore =
  global.__companySettingsStore ?? new Map<string, NormalizedCompanySettings>();

if (!global.__companySettingsStore) {
  global.__companySettingsStore = memoryStore;
}

function respond(payload: NormalizedCompanySettings, init?: ResponseInit) {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
    ...init,
  });
}

function transformRecord(
  record: {
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    themeMode: string | null;
    videoLink: string | null;
  } | null,
): NormalizedCompanySettings {
  if (!record) {
    return normalizeCompanySettings();
  }

  const normalized = normalizeCompanySettings(record);
  return normalized;
}

function resolveOrgId(request?: Request) {
  return request?.headers.get("x-org-id") ?? defaultOrgId;
}

function persistInMemory(orgId: string, settings: NormalizedCompanySettings) {
  memoryStore.set(orgId, settings);
}

async function loadFromPrisma(orgId: string): Promise<NormalizedCompanySettings | null> {
  try {
    const prisma = await getPrismaClient();

    if (!prisma?.companySettings) {
      return null;
    }

    const record = await prisma.companySettings.findUnique({
      where: { orgId: orgId },
      select: {
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        themeMode: true,
        videoLink: true,
      },
    });

    return transformRecord(record);
  } catch (error) {
    console.info("[company-settings][PRISMA] indisponível, tentando outras fontes.", {
      message: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

async function loadFromApi(orgId: string): Promise<NormalizedCompanySettings | null> {
  try {
    const response = await fetch(`${apiUrl}/company-settings`, {
      headers: {
        "x-org-id": orgId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as NormalizedCompanySettings;
    return transformRecord(payload);
  } catch (error) {
    console.info("[company-settings][API] indisponível, fallback garantido.", {
      message: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

async function persistWithPrisma(
  orgId: string,
  payload: NormalizedCompanySettings,
): Promise<NormalizedCompanySettings | null> {
  try {
    const prisma = await getPrismaClient();

    if (!prisma?.companySettings) {
      return null;
    }

    const sanitized = sanitizeForPersistence(payload);
    const record = await prisma.companySettings.upsert({
      where: { orgId: orgId },
      create: {
        orgId: orgId,
        ...sanitized,
      },
      update: sanitized,
      select: {
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        themeMode: true,
        videoLink: true,
      },
    });

    return transformRecord(record);
  } catch (error) {
    console.info("[company-settings][PRISMA] não persistiu, tentando API e fallback.", {
      message: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

async function persistWithApi(
  orgId: string,
  payload: NormalizedCompanySettings,
): Promise<NormalizedCompanySettings | null> {
  try {
    const response = await fetch(`${apiUrl}/company-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
      },
      body: JSON.stringify(sanitizeForPersistence(payload)),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const persisted = (await response.json()) as NormalizedCompanySettings;
    return transformRecord(persisted);
  } catch (error) {
    console.info("[company-settings][API] não persistiu, fallback garantido.", {
      message: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

export async function GET(request: Request) {
  const orgId = resolveOrgId(request);

  const prismaPayload = await loadFromPrisma(orgId);

  if (prismaPayload) {
    persistInMemory(orgId, prismaPayload);
    return respond(prismaPayload);
  }

  const apiPayload = await loadFromApi(orgId);

  if (apiPayload) {
    persistInMemory(orgId, apiPayload);
    return respond(apiPayload);
  }

  const fallback = memoryStore.get(orgId) ?? normalizeCompanySettings();
  persistInMemory(orgId, fallback);
  return respond(fallback);
}

export async function PUT(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return respond(normalizeCompanySettings(), { status: 400 });
  }

  const parsed = companySettingsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Não foi possível validar os dados enviados.",
        errors: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const normalized = normalizeCompanySettings(parsed.data);
  const orgId = resolveOrgId(request);

  const prismaPersisted = await persistWithPrisma(orgId, normalized);

  if (prismaPersisted) {
    persistInMemory(orgId, prismaPersisted);
    return respond(prismaPersisted);
  }

  const apiPersisted = await persistWithApi(orgId, normalized);

  if (apiPersisted) {
    persistInMemory(orgId, apiPersisted);
    return respond(apiPersisted);
  }

  persistInMemory(orgId, normalized);
  return respond(normalized);
}
