import { NextResponse } from "next/server";
import {
  type NormalizedCompanySettings,
  normalizeCompanySettings,
  sanitizeForPersistence,
} from "@/lib/company-settings";
import { getPrismaClient } from "@/lib/prisma";
import { companySettingsSchema } from "@/schemas/company-settings";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "alpha-syscore-morina";

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
    return memoryStore.get(COMPANY_ID) ?? normalizeCompanySettings();
  }

  const normalized = normalizeCompanySettings({
    logoUrl: record.logoUrl ?? undefined,
    primaryColor: record.primaryColor ?? undefined,
    secondaryColor: record.secondaryColor ?? undefined,
    themeMode: (record.themeMode as NormalizedCompanySettings["themeMode"]) ?? undefined,
    videoLink: record.videoLink ?? undefined,
  });

  memoryStore.set(COMPANY_ID, normalized);
  return normalized;
}

export async function GET() {
  const prisma = await getPrismaClient();
  try {
    if (prisma) {
      const record = await prisma.companySettings.findUnique({
        where: { companyId: COMPANY_ID },
        select: {
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          themeMode: true,
          videoLink: true,
        },
      });

      return respond(transformRecord(record));
    }

    return respond(memoryStore.get(COMPANY_ID) ?? normalizeCompanySettings());
  } catch (error) {
    console.error("[company-settings][GET] falling back to memory store", error);
    return respond(memoryStore.get(COMPANY_ID) ?? normalizeCompanySettings());
  }
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

  try {
    const prisma = await getPrismaClient();

    if (prisma) {
      const persisted = await prisma.companySettings.upsert({
        where: { companyId: COMPANY_ID },
        update: sanitizeForPersistence(normalized),
        create: {
          companyId: COMPANY_ID,
          ...sanitizeForPersistence(normalized),
        },
        select: {
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          themeMode: true,
          videoLink: true,
        },
      });

      return respond(transformRecord(persisted));
    }

    memoryStore.set(COMPANY_ID, normalized);
    return respond(normalized);
  } catch (error) {
    console.error("[company-settings][PUT] falling back to in-memory persistence", error);
    memoryStore.set(COMPANY_ID, normalized);
    return respond(normalized);
  }
}
