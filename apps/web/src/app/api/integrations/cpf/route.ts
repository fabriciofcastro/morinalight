import { NextResponse } from "next/server";

/**
 * Cache de CPFs validados (opcional - pode usar Redis em produção)
 */
const cpfCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 */
function validarCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]!) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleaned[9]!) !== firstDigit) {
    return false;
  }

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]!) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleaned[10]!) !== secondDigit) {
    return false;
  }

  return true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get("cpf");

  if (!cpf) {
    return NextResponse.json({ message: "CPF é obrigatório" }, { status: 400 });
  }

  // Validar formato e dígitos verificadores
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) {
    return NextResponse.json({ message: "CPF inválido. Deve ter 11 dígitos." }, { status: 400 });
  }

  if (!validarCpf(cpfLimpo)) {
    return NextResponse.json({ message: "CPF inválido. Dígitos verificadores incorretos." }, { status: 400 });
  }

  // Verificar cache
  const cached = cpfCache.get(cpfLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=86400", // 24 horas
      },
    });
  }

  try {
    // Nota: Devido à LGPD, não há APIs públicas gratuitas para buscar dados completos de CPF
    // Retornamos apenas a validação e formatação
    // Em produção, pode integrar com serviços pagos se necessário

    const data = {
      cpf: cpfLimpo,
      valido: true,
      formatado: cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
    };

    // Armazenar no cache
    cpfCache.set(cpfLimpo, {
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
    console.error("Erro ao validar CPF:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erro ao validar CPF",
      },
      { status: 500 },
    );
  }
}

