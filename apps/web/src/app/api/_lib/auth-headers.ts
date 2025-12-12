import { cookies } from "next/headers";

/**
 * Monta headers de autenticação para chamadas server-side:
 * - Bearer a partir do cookie httpOnly auth_token
 * - x-org-id a partir do cookie selected_org_id (se existir)
 * - Mescla headers extras recebidos
 */
export function buildAuthHeaders(extra?: HeadersInit): HeadersInit {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const orgId = cookieStore.get("selected_org_id")?.value;

  const headers: HeadersInit = { ...(extra ?? {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  return headers;
}
