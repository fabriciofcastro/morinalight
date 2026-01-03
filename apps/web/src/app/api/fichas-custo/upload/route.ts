import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "foto" ou "documento"
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

    // Validar tipo de arquivo
    if (type === "foto") {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { message: "Formato de arquivo não suportado. Use JPEG, PNG ou WebP" },
          { status: 400 },
        );
      }
    } else {
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { message: "Formato de arquivo não suportado. Use PDF, JPG ou PNG" },
          { status: 400 },
        );
      }
    }

    // Validar tamanho (10MB para documentos, 5MB para fotos)
    const maxSize = type === "foto" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: `Arquivo muito grande. Tamanho máximo: ${type === "foto" ? "5MB" : "10MB"}` },
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
    const storageKey = `fichas-custo/${orgId}/${type}/${Date.now()}-${file.name}`;

    return NextResponse.json({
      url: dataUrl,
      storageKey,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { message: "Erro ao fazer upload do arquivo" },
      { status: 500 },
    );
  }
}



