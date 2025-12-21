/**
 * Utilitários avançados para processamento de imagens
 * Inclui redimensionamento, otimização, validação e conversão
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ProcessedImage {
  dataUrl: string;
  blob: Blob;
  dimensions: ImageDimensions;
  size: number;
  format: string;
}

/**
 * Obtém dimensões de uma imagem
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };

    img.src = url;
  });
}

/**
 * Redimensiona e otimiza uma imagem
 */
export async function processImage(
  file: File,
  options: ImageProcessingOptions = {},
): Promise<ProcessedImage> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.9,
    format = "webp",
    maintainAspectRatio = true,
    backgroundColor = "#ffffff",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calcular novas dimensões
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > maxWidth || height > maxHeight) {
        if (maintainAspectRatio) {
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          } else {
            height = maxHeight;
            width = height * aspectRatio;
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
          }
        } else {
          width = Math.min(width, maxWidth);
          height = Math.min(height, maxHeight);
        }
      }

      // Criar canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      // Preencher fundo se necessário
      if (format === "jpeg" || backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Erro ao processar imagem"));
            return;
          }

          // Converter blob para data URL
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              dataUrl: reader.result as string,
              blob,
              dimensions: { width, height, aspectRatio },
              size: blob.size,
              format: blob.type,
            });
          };
          reader.onerror = () => reject(new Error("Erro ao converter blob"));
          reader.readAsDataURL(blob);
        },
        `image/${format}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };

    img.src = url;
  });
}

/**
 * Cria múltiplas versões de uma imagem (thumbnail, medium, large)
 */
export async function createImageVariants(
  file: File,
): Promise<{
  thumbnail: ProcessedImage;
  medium: ProcessedImage;
  large: ProcessedImage;
  original: ProcessedImage;
}> {
  const [thumbnail, medium, large, original] = await Promise.all([
    processImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.7, format: "webp" }),
    processImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.85, format: "webp" }),
    processImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.9, format: "webp" }),
    processImage(file, { quality: 0.95, format: "webp" }),
  ]);

  return { thumbnail, medium, large, original };
}

/**
 * Valida se uma imagem atende aos requisitos
 */
export async function validateImage(
  file: File,
  options: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxSize?: number; // bytes
    allowedFormats?: string[];
    aspectRatio?: { min: number; max: number };
  } = {},
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const {
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    maxSize = 10 * 1024 * 1024, // 10MB padrão
    allowedFormats = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    aspectRatio,
  } = options;

  // Validar tamanho
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`);
  }

  // Validar formato
  if (!allowedFormats.includes(file.type)) {
    errors.push(`Formato não permitido. Permitidos: ${allowedFormats.join(", ")}`);
  }

  // Validar dimensões (apenas para imagens não-SVG)
  if (file.type !== "image/svg+xml") {
    try {
      const dimensions = await getImageDimensions(file);

      if (minWidth && dimensions.width < minWidth) {
        errors.push(`Largura mínima: ${minWidth}px`);
      }
      if (maxWidth && dimensions.width > maxWidth) {
        errors.push(`Largura máxima: ${maxWidth}px`);
      }
      if (minHeight && dimensions.height < minHeight) {
        errors.push(`Altura mínima: ${minHeight}px`);
      }
      if (maxHeight && dimensions.height > maxHeight) {
        errors.push(`Altura máxima: ${maxHeight}px`);
      }
      if (aspectRatio) {
        if (
          dimensions.aspectRatio < aspectRatio.min ||
          dimensions.aspectRatio > aspectRatio.max
        ) {
          errors.push(
            `Proporção inválida. Deve estar entre ${aspectRatio.min}:1 e ${aspectRatio.max}:1`,
          );
        }
      }
    } catch (error) {
      errors.push("Não foi possível ler as dimensões da imagem");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Extrai cor dominante de uma imagem
 */
export async function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // Calcular cor média
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
      resolve(hex);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };

    img.src = url;
  });
}



