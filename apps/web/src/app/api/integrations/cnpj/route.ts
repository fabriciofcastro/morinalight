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

  // Validar formato e dígitos verificadores
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) {
    return NextResponse.json({ message: "CNPJ inválido. Deve ter 14 dígitos." }, { status: 400 });
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
    return NextResponse.json({ message: "CNPJ inválido." }, { status: 400 });
  }

  // Validar dígitos verificadores
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpjLimpo[i]!) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cnpjLimpo[12]!) !== firstDigit) {
    return NextResponse.json({ message: "CNPJ inválido. Dígito verificador incorreto." }, { status: 400 });
  }

  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpjLimpo[i]!) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cnpjLimpo[13]!) !== secondDigit) {
    return NextResponse.json({ message: "CNPJ inválido. Dígito verificador incorreto." }, { status: 400 });
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
      // Tentar ler a mensagem de erro da API
      let errorMessage = "Erro ao buscar CNPJ";
      let errorCode = "UNKNOWN_ERROR";
      
      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            // Extrair mensagem de forma segura
            if (typeof errorData === "string") {
              errorMessage = errorData;
            } else if (errorData && typeof errorData === "object") {
              errorMessage = errorData.message || errorData.error || errorData.detail || errorData.title || JSON.stringify(errorData);
              errorCode = errorData.code || errorCode;
            }
          } catch {
            // Se não for JSON, usar o texto direto
            errorMessage = text.length > 200 ? text.substring(0, 200) + "..." : text;
          }
        }
      } catch {
        // Se não conseguir ler, usar mensagem padrão baseada no status
      }
      
      // Mensagens específicas por status code
      if (response.status === 403) {
        errorMessage = "Acesso negado. O serviço pode estar bloqueando requisições ou o CNPJ pode estar restrito.";
        errorCode = "FORBIDDEN";
      } else if (response.status === 404) {
        errorMessage = "CNPJ não encontrado na base de dados.";
        errorCode = "NOT_FOUND";
      } else if (response.status === 429) {
        errorMessage = "Muitas requisições. Aguarde alguns instantes antes de tentar novamente.";
        errorCode = "RATE_LIMIT";
      } else if (response.status === 503 || response.status === 502) {
        errorMessage = "Serviço temporariamente indisponível. Tente novamente mais tarde.";
        errorCode = "SERVICE_UNAVAILABLE";
      } else if (response.status >= 500) {
        errorMessage = "Erro no servidor. Tente novamente mais tarde.";
        errorCode = "SERVER_ERROR";
      }
      
      // Retornar resposta apropriada baseada no status
      if (response.status === 404) {
        return NextResponse.json({ message: errorMessage, code: errorCode }, { status: 404 });
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          {
            message: errorMessage,
            code: errorCode,
          },
          { status: 403 },
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          {
            message: errorMessage,
            code: errorCode,
          },
          { status: 429 },
        );
      }
      
      if (response.status === 503 || response.status === 502) {
        return NextResponse.json(
          {
            message: errorMessage,
            code: errorCode,
          },
          { status: 503 },
        );
      }
      
      // Para outros erros, retornar como 503 para não expor detalhes internos
      return NextResponse.json(
        {
          message: errorMessage,
          code: errorCode,
        },
        { status: 503 },
      );
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

    // Tratamento de erros mais específico
    if (error instanceof Error) {
      // Timeout ou erro de rede
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return NextResponse.json(
          {
            message: "Erro de conexão. Tente novamente em alguns instantes.",
            code: "NETWORK_ERROR",
          },
          { status: 503 },
        );
      }

      // Erro da API
      if (error.message.includes("API")) {
        return NextResponse.json(
          {
            message: "Serviço temporariamente indisponível. Tente novamente mais tarde.",
            code: "SERVICE_UNAVAILABLE",
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erro ao buscar CNPJ",
        code: "UNKNOWN_ERROR",
      },
      { status: 500 },
    );
  }
}




