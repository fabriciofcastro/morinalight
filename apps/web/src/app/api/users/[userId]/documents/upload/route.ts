import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;
    const reason = formData.get("reason") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: "Tipo de documento não fornecido" }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB." }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use PDF, JPG ou PNG." },
        { status: 400 },
      );
    }

    // Criar FormData para enviar ao backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("documentType", documentType);
    if (reason) {
      backendFormData.append("reason", reason);
    }

    const headers = await buildAuthHeaders({}) as any;
    delete headers["Content-Type"]; // Permitir que o browser defina o boundary

    const response = await fetch(`${apiUrl}/users/${userId}/documents/upload`, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao fazer upload" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao fazer upload de documento:", error);
    return NextResponse.json(
      { error: "Erro interno ao fazer upload do documento" },
      { status: 500 },
    );
  }
}



