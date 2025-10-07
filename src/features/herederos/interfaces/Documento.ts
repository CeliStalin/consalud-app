interface Documento {
  id: number; //correlativo
  nombre: string; //nombre del archivo
  tamaño: number; //peso
  tipo: string; // cedula, poder, posesión
  tipoId: number; // ID del tipo de documento
  fechaCarga: string; // fecha de carga en ISO string
  hash?: string; // hash del archivo para verificar integridad
  comprimido?: boolean; // indica si el archivo está comprimido
  url?: string; // URL del blob (para archivos pequeños)
  metadata?: {
    originalSize: number;
    compressedSize?: number;
    mimeType: string;
    lastModified: number;
  };
}

// Estado de archivo para el componente de carga
interface FileState {
  file: File | null;
  error: string | null;
  documento?: Documento; // documento procesado
}

// Estado de documentos por tipo
interface DocumentFileState {
  [key: number]: FileState;
}

// Configuración para el almacenamiento de archivos
interface FileStorageConfig {
  maxFileSize: number; // tamaño máximo en bytes
  maxTotalSize: number; // tamaño total máximo en bytes
  compressionThreshold: number; // tamaño mínimo para comprimir
  allowedTypes: string[]; // tipos MIME permitidos
  storageKeyPrefix: string; // prefijo para las claves de storage
}

// Tipos para la API de documentos
export interface DocumentosRequest {
  idSolicitud: number;
  usuarioCreacion: string;
  rutTitularFallecido: number;
  documentos: DocumentoItem[];
}

export interface DocumentoItem {
  idTipoDocumento: number;
  Documento: File;
}

export interface DocumentosResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: string[];
  status?: number;
}

export interface DocumentosApiError {
  code: string;
  message: string;
  details?: string;
}

export type { DocumentFileState, Documento, FileState, FileStorageConfig };
