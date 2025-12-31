import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  const response = await fetch(`${apiUrl}/users/export?${params.toString()}`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao exportar usuários" }));
    return NextResponse.json(error, { status: response.status });
  }

  // Se for CSV ou JSON, retornar o conteúdo diretamente
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/csv") || contentType?.includes("application/json")) {
    const content = await response.text();
    const contentDisposition = response.headers.get("content-disposition");
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition || 'attachment; filename="usuarios.csv"',
      },
    });
  }

  const data = await response.json();
  return NextResponse.json(data);
}


