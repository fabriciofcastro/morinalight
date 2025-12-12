import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function DELETE(
  _request: Request,
  { params }: { params: { departmentId: string; userId: string } },
) {
  const response = await fetch(
    `${apiUrl}/departments/${params.departmentId}/members/${params.userId}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao remover membro do departamento" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true }, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { departmentId: string; userId: string } },
) {
  const body = await request.json();

  const response = await fetch(
    `${apiUrl}/departments/${params.departmentId}/members/${params.userId}`,
    {
      method: "PATCH",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar role do membro" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
