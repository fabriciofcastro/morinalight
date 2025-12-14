import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orgId = formData.get("orgId") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "Arquivo não fornecido" },
        { status: 400 },
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { message: "orgId não fornecido" },
        { status: 400 },
      );
    }

    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Formato de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 },
      );
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "Arquivo muito grande. Tamanho máximo: 5MB" },
        { status: 400 },
      );
    }

    // Converter para base64 para enviar ao backend
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Por enquanto, retornamos a data URL diretamente
    // TODO: Em produção, fazer upload para S3/MinIO via backend
    const storageKey = `pre-fichas-tecnicas/${orgId}/${Date.now()}-${file.name}`;

    return NextResponse.json({
      url: dataUrl,
      storageKey,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Erro ao fazer upload de foto:", error);
    return NextResponse.json(
      { message: "Erro ao fazer upload da foto" },
      { status: 500 },
    );
  }
}

