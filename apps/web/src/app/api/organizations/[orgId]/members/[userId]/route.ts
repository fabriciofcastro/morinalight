import { NextResponse } from "next/server";

import { apiUrl, defaultActorId, defaultOrgId } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: {
    orgId?: string;
    userId: string;
  };
};

function resolveOrgId(paramOrgId?: string) {
  return paramOrgId ?? defaultOrgId;
}

function resolveActorId(request: Request) {
  return request.headers.get("x-user-id") ?? defaultActorId;
}

async function proxy<T>(input: RequestInfo | URL, init?: RequestInit): Promise<NextResponse<T>> {
  try {
    const response = await fetch(input, init);

    if (response.status === 204) {
      return new NextResponse(null, { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = (isJson ? await response.json() : await response.text()) as T;

    return NextResponse.json(payload, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message } as unknown as T, { status: 502 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const actorId = resolveActorId(request);
  const orgId = resolveOrgId(params.orgId);
  const targetUserId = params.userId;
  const authHeaders = buildAuthHeaders();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  return proxy(`${apiUrl}/organizations/${orgId}/members/${targetUserId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": actorId,
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const actorId = resolveActorId(request);
  const orgId = resolveOrgId(params.orgId);
  const targetUserId = params.userId;
  const authHeaders = buildAuthHeaders();

  const response = await fetch(`${apiUrl}/organizations/${orgId}/members/${targetUserId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": actorId,
      ...authHeaders,
    },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = (isJson ? await response.json() : await response.text()) as
    | { message?: string }
    | string;

  if (isJson) {
    return NextResponse.json(payload as { message?: string }, { status: response.status });
  }

  return NextResponse.json({ message: String(payload) }, { status: response.status });
}
