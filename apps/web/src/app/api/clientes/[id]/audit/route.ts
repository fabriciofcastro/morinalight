import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(request.url);
  const paramsQuery = new URLSearchParams();

  // Parâmetros de paginação e filtros
  const cursor = searchParams.get("cursor");
  const limite = searchParams.get("limite");

  if (cursor) paramsQuery.append("cursor", cursor);
  if (limite) paramsQuery.append("limite", limite);

  // Filtrar por entityId (clienteId) e entityType
  paramsQuery.append("entityId", params.id);
  paramsQuery.append("entityType", "Cliente");

  try {
    // Usar a API de audit log organizacional que pode ter logs relacionados a clientes
    const response = await fetch(`${apiUrl}/organizational-structure/audit-log?${paramsQuery.toString()}`, {
      method: "GET",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    });

    if (!response.ok) {
      // Se a API não existir ou falhar, retornar array vazio
      return NextResponse.json({ itens: [] });
    }

    const data = await response.json();

    // Mapear os dados para o formato esperado pelo frontend
    const mappedItems = (data.itens || []).map((item: {
      id: string;
      entityType: string;
      entityId: string;
      action: string;
      actorId: string;
      createdAt: string;
      payload?: {
        field?: string;
        oldValue?: string | null;
        newValue?: string | null;
        reason?: string | null;
        performedByEmail?: string | null;
      };
    }) => {
      const payload = item.payload || {};
      return {
        id: item.id,
        acao: item.action,
        campo: payload.field || null,
        estadoAnterior: payload.oldValue || null,
        estadoNovo: payload.newValue || null,
        actorId: item.actorId,
        createdAt: item.createdAt,
        justificativa: payload.reason || null,
        performedByEmail: payload.performedByEmail || null,
      };
    });

    return NextResponse.json({ itens: mappedItems });
  } catch (error) {
    console.error("Erro ao buscar histórico do cliente:", error);
    // Retornar array vazio em caso de erro
    return NextResponse.json({ itens: [] });
  }
}


