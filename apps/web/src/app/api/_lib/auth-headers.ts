import { cookies } from "next/headers";

/**
 * Monta headers de autenticação para chamadas server-side:
 * - Bearer a partir do cookie httpOnly auth_token
 * - x-org-id a partir do cookie selected_org_id (se existir)
 * - Mescla headers extras recebidos
 */
export async function buildAuthHeaders(extra?: HeadersInit): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const orgId = cookieStore.get("selected_org_id")?.value;

  const headers: any = { ...(extra ?? {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  return headers;
}
