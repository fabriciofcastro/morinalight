import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    // TODO: Implementar endpoint no backend para histórico de documentos
    // Por enquanto, retornar array vazio
    // Quando o backend estiver disponível, usar:
    // const response = await fetch(`${apiUrl}/users/${userId}/documents/history`, {
    //   method: "GET",
    //   headers,
    //   cache: "no-store",
    // });

    // Estrutura esperada pelo frontend:
    // {
    //   itens: [
    //     {
    //       id: string;
    //       documentType: string; // "RG Frente", "RG Verso", "CPF", "CTPS", etc.
    //       fileName: string;
    //       version: number;
    //       uploadedBy: string;
    //       uploadedAt: string;
    //       fileUrl: string | null;
    //       fileSize: number | null;
    //       reason?: string | null;
    //     }
    //   ]
    // }

    return NextResponse.json({ itens: [] });
  } catch (error) {
    console.error("Erro ao buscar histórico de documentos:", error);
    return NextResponse.json({ itens: [] });
  }
}



