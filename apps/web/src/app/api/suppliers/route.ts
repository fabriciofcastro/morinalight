import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../_lib/auth-headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    // Timeout de 10 segundos para não ficar esperando indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(`${apiUrl}/suppliers?${params.toString()}`, {
        headers,
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { message: "Timeout: API não respondeu a tempo. Verifique se a API está rodando." },
          { status: 504 },
        );
      }
      // Erro de conexão (ECONNREFUSED, etc)
      const isConnectionError =
        fetchError instanceof Error &&
        (fetchError.message.includes("ECONNREFUSED") ||
          fetchError.message.includes("fetch failed") ||
          fetchError.message.includes("network"));
      if (isConnectionError) {
        return NextResponse.json(
          {
            message: "API não está disponível. Verifique se o servidor está rodando em http://localhost:3333",
            code: "API_UNAVAILABLE",
          },
          { status: 503 },
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Erro ao buscar fornecedores",
      }));

      return NextResponse.json(
        {
          message: errorData.message || "Erro ao buscar fornecedores",
          code: errorData.code,
          errors: errorData.errors,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na rota GET /api/suppliers:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erro interno ao buscar fornecedores",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(`${apiUrl}/suppliers`, {
        method: "POST",
        headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { message: "Timeout: API não respondeu a tempo. Verifique se a API está rodando." },
          { status: 504 },
        );
      }
      // Erro de conexão
      const isConnectionError =
        fetchError instanceof Error &&
        (fetchError.message.includes("ECONNREFUSED") ||
          fetchError.message.includes("fetch failed") ||
          fetchError.message.includes("network"));
      if (isConnectionError) {
        return NextResponse.json(
          {
            message: "API não está disponível. Verifique se o servidor está rodando em http://localhost:3333",
            code: "API_UNAVAILABLE",
          },
          { status: 503 },
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Erro ao criar fornecedor",
      }));
      return NextResponse.json(
        {
          message: errorData.message || "Erro ao criar fornecedor",
          code: errorData.code,
          errors: errorData.errors,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro na rota POST /api/suppliers:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erro interno ao criar fornecedor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
