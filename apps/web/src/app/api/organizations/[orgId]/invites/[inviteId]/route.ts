import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiUrl, defaultActorId, defaultOrgId } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: {
    orgId?: string;
    inviteId: string;
  };
};

function resolveOrgId(paramOrgId?: string) {
  return paramOrgId ?? defaultOrgId;
}

function resolveActorId(request: Request) {
  return request.headers.get("x-user-id") ?? defaultActorId;
}

function getAuthHeaders(): HeadersInit {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const actorId = resolveActorId(request);
  const orgId = resolveOrgId(params.orgId);
  const inviteId = params.inviteId;
  const authHeaders = getAuthHeaders();

  const response = await fetch(`${apiUrl}/organizations/${orgId}/invites/${inviteId}`, {
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

