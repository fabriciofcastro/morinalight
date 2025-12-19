/**
 * Validadores para upload de arquivos
 */

export type FileValidationOptions = {
  maxSize?: number; // em bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[]; // extensões de arquivo
  minWidth?: number; // para imagens
  maxWidth?: number; // para imagens
  minHeight?: number; // para imagens
  maxHeight?: number; // para imagens
  maxFiles?: number; // para múltiplos arquivos
};

export type FileValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Valida um arquivo único
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {},
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const {
    maxSize = 10 * 1024 * 1024, // 10MB padrão
    allowedTypes = [],
    allowedExtensions = [],
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
  } = options;

  // Validar tamanho
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`);
  }

  // Validar tipo MIME
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(", ")}`);
  }

  // Validar extensão
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Extensão não permitida. Extensões permitidas: ${allowedExtensions.join(", ")}`);
    }
  }

  // Validar dimensões de imagem
  if (file.type.startsWith("image/") && (minWidth || maxWidth || minHeight || maxHeight)) {
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
 * Valida múltiplos arquivos
 */
export async function validateFiles(
  files: File[],
  options: FileValidationOptions = {},
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const { maxFiles } = options;

  // Validar quantidade
  if (maxFiles && files.length > maxFiles) {
    errors.push(`Máximo de ${maxFiles} arquivo(s) permitido(s)`);
    return { valid: false, errors };
  }

  // Validar cada arquivo
  for (const file of files) {
    const result = await validateFile(file, options);
    if (!result.valid) {
      errors.push(`${file.name}: ${result.errors.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Obtém dimensões de uma imagem
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };

    img.src = url;
  });
}

/**
 * Formata tamanho de arquivo
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Presets de validação comuns
 */
export const fileValidationPresets = {
  image: {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  document: {
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: ["pdf", "doc", "docx"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  avatar: {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    maxSize: 2 * 1024 * 1024, // 2MB
    minWidth: 100,
    maxWidth: 2000,
    minHeight: 100,
    maxHeight: 2000,
  },
  userDocument: {
    allowedTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ],
    allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};


