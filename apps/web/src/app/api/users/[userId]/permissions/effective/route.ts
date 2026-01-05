import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const response = await fetch(`${apiUrl}/users/${userId}/permissions/effective`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar permissões efetivas" },
      { status: response.status },
    );
  }

  const data = await response.json();

  // Inject MFA status from cookie
  const cookieStore = await import("next/headers").then(mod => mod.cookies());
  const mfaVerified = cookieStore.get("mfa_verified")?.value === "true";

  if (!data.context) {
    data.context = {};
  }
  data.context.mfaVerified = mfaVerified;

  return NextResponse.json(data);
}
