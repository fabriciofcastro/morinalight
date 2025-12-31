import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{ templateId: string;
   }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { templateId } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/permissions/templates/${templateId}/apply`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro ao aplicar template de permissões" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
