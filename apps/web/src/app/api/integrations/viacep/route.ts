import { NextResponse } from "next/server";

const VIA_CEP_BASE_URL = "https://viacep.com.br/ws";

/**
 * Cache de CEPs (opcional - pode usar Redis em produção)
 */
const cepCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get("cep");

  if (!cep) {
    return NextResponse.json({ message: "CEP é obrigatório" }, { status: 400 });
  }

  // Validar formato
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return NextResponse.json({ message: "CEP inválido. Deve ter 8 dígitos." }, { status: 400 });
  }

  // Verificar cache
  const cached = cepCache.get(cepLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=86400", // 24 horas
      },
    });
  }

  try {
    // Buscar na ViaCEP
    const response = await fetch(`${VIA_CEP_BASE_URL}/${cepLimpo}/json/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400 }, // Cache por 24 horas
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Erro ao buscar CEP na ViaCEP", erro: true },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Salvar no cache
    cepCache.set(cepLimpo, { data, timestamp: Date.now() });

    // Limpar cache antigo (manter apenas últimos 1000)
    if (cepCache.size > 1000) {
      const entries = Array.from(cepCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cepCache.clear();
      entries.slice(0, 1000).forEach(([key, value]) => {
        cepCache.set(key, value);
      });
    }

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=86400", // 24 horas
      },
    });
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return NextResponse.json(
      { message: "Erro ao buscar CEP", erro: true },
      { status: 500 },
    );
  }
}





