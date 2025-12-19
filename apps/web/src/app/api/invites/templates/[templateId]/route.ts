import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function PUT(
  request: Request,
  { params }: { params: { templateId: string } },
) {
  try {
    const body = await request.json();
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/invites/templates/${params.templateId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao atualizar template" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar template de convite:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar template" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { templateId: string } },
) {
  try {
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/invites/templates/${params.templateId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao deletar template" }));
      return NextResponse.json(error, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar template de convite:", error);
    return NextResponse.json(
      { error: "Erro interno ao deletar template" },
      { status: 500 },
    );
  }
}



