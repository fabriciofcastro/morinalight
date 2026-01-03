import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Arquivo não fornecido" },
        { status: 400 },
      );
    }

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Formato de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "Arquivo muito grande. Tamanho máximo: 5MB" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const headers = await buildAuthHeaders({}) as any;
    delete headers["Content-Type"]; // Allow browser to set boundary

    const response = await fetch(`${apiUrl}/profile/avatar`, {
      method: "POST",
      headers,
      body: backendFormData,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao fazer upload do avatar" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    return NextResponse.json(
      { message: "Erro ao fazer upload do avatar" },
      { status: 500 },
    );
  }
}



