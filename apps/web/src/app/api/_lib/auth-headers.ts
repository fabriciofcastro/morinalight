import { cookies } from "next/headers";
import { defaultOrgId } from "@/lib/env";

/**
 * Monta headers de autenticação para chamadas server-side:
 * - Bearer a partir do cookie httpOnly auth_token
 * - x-org-id a partir do header extra, cookie, ou defaultOrgId
 * - Mescla headers extras recebidos
 */
export async function buildAuthHeaders(extra?: HeadersInit): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? cookieStore.get("auth_token")?.value;
  const orgIdFromCookie = cookieStore.get("selected_org_id")?.value;

  const headers: any = { ...(extra ?? {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Determine orgId with priority: extra headers > cookie > env default
  let orgId = headers["x-organization-id"] || headers["x-org-id"];

  if (!orgId && orgIdFromCookie) {
    orgId = orgIdFromCookie;
  }

  if (!orgId && defaultOrgId) {
    orgId = defaultOrgId;
  }

  // Set x-org-id for backend API (it expects this exact header name)
  if (orgId) {
    headers["x-org-id"] = orgId;
    // Keep x-organization-id for compatibility if it was already set
    if (!headers["x-organization-id"]) {
      headers["x-organization-id"] = orgId;
    }
  }

  return headers;
}

