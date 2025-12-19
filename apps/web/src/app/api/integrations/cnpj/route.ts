import { NextResponse } from "next/server";

const BRASIL_API_BASE_URL = "https://brasilapi.com.br/api/cnpj/v1";

/**
 * Cache de CNPJs (opcional - pode usar Redis em produção)
 */
const cnpjCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get("cnpj");

  if (!cnpj) {
    return NextResponse.json({ message: "CNPJ é obrigatório" }, { status: 400 });
  }

  // Validar formato
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) {
    return NextResponse.json({ message: "CNPJ inválido. Deve ter 14 dígitos." }, { status: 400 });
  }

  // Verificar cache
  const cached = cnpjCache.get(cnpjLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=86400", // 24 horas
      },
    });
  }

  try {
    // Buscar na BrasilAPI
    const response = await fetch(`${BRASIL_API_BASE_URL}/${cnpjLimpo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: "CNPJ não encontrado" }, { status: 404 });
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();

    // Armazenar no cache
    cnpjCache.set(cnpjLimpo, {
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=86400", // 24 horas
      },
    });
  } catch (error) {
    console.error("Erro ao buscar CNPJ:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erro ao buscar CNPJ",
      },
      { status: 500 },
    );
  }
}




