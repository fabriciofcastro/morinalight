/**
 * Serviço de Storage para upload de arquivos
 * Suporta S3/MinIO e fallback para filesystem local
 */

export interface StorageConfig {
  provider: "s3" | "filesystem";
  s3?: {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
  };
  filesystem?: {
    uploadDir: string;
    publicUrl: string;
  };
}

export interface UploadResult {
  url: string;
  storageKey: string;
  size: number;
  mimetype: string;
}

export class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    path: string,
  ): Promise<UploadResult> {
    const storageKey = `${path}/${Date.now()}-${filename}`;

    if (this.config.provider === "s3" && this.config.s3) {
      return this.uploadToS3(file, storageKey, mimetype);
    }

    // Fallback para filesystem
    return this.uploadToFilesystem(file, storageKey, mimetype, filename);
  }

  private async uploadToS3(
    file: Buffer,
    storageKey: string,
    mimetype: string,
  ): Promise<UploadResult> {
    // Por enquanto, retornar data URL como fallback
    // TODO: Implementar upload real para S3 quando @aws-sdk/client-s3 estiver instalado
    const base64 = file.toString("base64");
    const dataUrl = `data:${mimetype};base64,${base64}`;

    return {
      url: dataUrl,
      storageKey,
      size: file.length,
      mimetype,
    };
  }

  private async uploadToFilesystem(
    file: Buffer,
    storageKey: string,
    mimetype: string,
    _filename: string,
  ): Promise<UploadResult> {
    // Por enquanto, retornar data URL
    // Em produção, salvar no filesystem e retornar URL pública
    const base64 = file.toString("base64");
    const dataUrl = `data:${mimetype};base64,${base64}`;

    return {
      url: dataUrl,
      storageKey,
      size: file.length,
      mimetype,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    // TODO: Implementar deleção quando storage real estiver configurado
    console.log(`[Storage] Deleting file: ${storageKey}`);
  }
}

// Instância singleton
let storageServiceInstance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    const provider = (process.env.STORAGE_PROVIDER as "s3" | "filesystem") || "filesystem";

    const config: StorageConfig = {
      provider,
      s3: process.env.S3_ENDPOINT
        ? {
            endpoint: process.env.S3_ENDPOINT,
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
            bucket: process.env.S3_BUCKET || "morina",
            region: process.env.S3_REGION || "us-east-1",
          }
        : undefined,
      filesystem: {
        uploadDir: process.env.UPLOAD_DIR || "./uploads",
        publicUrl: process.env.PUBLIC_URL || "http://localhost:3333/uploads",
      },
    };

    storageServiceInstance = new StorageService(config);
  }

  return storageServiceInstance;
}
