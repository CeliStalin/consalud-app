import { Documento, FileStorageConfig } from '../interfaces/Documento';

// Configuración por defecto
const DEFAULT_CONFIG: FileStorageConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxTotalSize: 50 * 1024 * 1024, // 50MB total
    compressionThreshold: 1024 * 1024, // 1MB
    allowedTypes: ['application/pdf'],
    storageKeyPrefix: 'documentos_'
};

// Función para generar hash simple del archivo
const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Función para comprimir archivo usando Canvas (para imágenes) o mantener como está (para PDFs)
const compressFile = async (file: File): Promise<{ blob: Blob; compressed: boolean }> => {
    if (file.type === 'application/pdf') {
        // Para PDFs, no comprimimos pero verificamos el tamaño
        return { blob: file, compressed: false };
    }
    
    // Para otros tipos, intentamos comprimir si es posible
    return { blob: file, compressed: false };
};

// Función para crear URL de blob
const createBlobUrl = (blob: Blob): string => {
    return URL.createObjectURL(blob);
};

// Función para limpiar URLs de blob
const revokeBlobUrl = (url: string): void => {
    URL.revokeObjectURL(url);
};

// Función para obtener el tamaño total de archivos almacenados
const getTotalStorageSize = (rut: string): number => {
    const config = DEFAULT_CONFIG;
    const storageKey = `${config.storageKeyPrefix}${rut.replace(/[^0-9kK]/g, '')}`;
    const stored = sessionStorage.getItem(storageKey);
    
    if (!stored) return 0;
    
    try {
        const documentos: Documento[] = JSON.parse(stored);
        return documentos.reduce((total, doc) => total + doc.tamaño, 0);
    } catch {
        return 0;
    }
};

// Función para limpiar archivos antiguos si se excede el límite
const cleanupOldFiles = (rut: string, newFileSize: number): void => {
    const config = DEFAULT_CONFIG;
    const storageKey = `${config.storageKeyPrefix}${rut.replace(/[^0-9kK]/g, '')}`;
    const stored = sessionStorage.getItem(storageKey);
    
    if (!stored) return;
    
    try {
        const documentos: Documento[] = JSON.parse(stored);
        const currentTotal = documentos.reduce((total, doc) => total + doc.tamaño, 0);
        
        if (currentTotal + newFileSize > config.maxTotalSize) {
            // Ordenar por fecha de carga (más antiguos primero)
            const sortedDocs = documentos.sort((a, b) => 
                new Date(a.fechaCarga).getTime() - new Date(b.fechaCarga).getTime()
            );
            
            let totalToRemove = currentTotal + newFileSize - config.maxTotalSize;
            const docsToKeep: Documento[] = [];
            
            for (const doc of sortedDocs) {
                if (totalToRemove > 0) {
                    // Revocar URL si existe
                    if (doc.url) {
                        revokeBlobUrl(doc.url);
                    }
                    totalToRemove -= doc.tamaño;
                } else {
                    docsToKeep.push(doc);
                }
            }
            
            // Guardar solo los documentos que caben
            sessionStorage.setItem(storageKey, JSON.stringify(docsToKeep));
        }
    } catch (error) {
        console.error('Error al limpiar archivos antiguos:', error);
    }
};

// Función principal para guardar archivo
export const saveFileToStorage = async (
    file: File, 
    tipoId: number, 
    tipo: string, 
    rut: string,
    config: Partial<FileStorageConfig> = {}
): Promise<Documento> => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Validar archivo
    if (file.size > finalConfig.maxFileSize) {
        throw new Error(`El archivo debe ser menor a ${finalConfig.maxFileSize / (1024 * 1024)}MB`);
    }
    
    if (!finalConfig.allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido');
    }
    
    // Verificar espacio disponible
    const currentTotal = getTotalStorageSize(rut);
    if (currentTotal + file.size > finalConfig.maxTotalSize) {
        cleanupOldFiles(rut, file.size);
    }
    
    // Generar hash del archivo
    const hash = await generateFileHash(file);
    
    // Comprimir si es necesario
    const { blob, compressed } = await compressFile(file);
    
    // Crear URL de blob solo para archivos pequeños
    const useBlobUrl = file.size < finalConfig.compressionThreshold;
    const url = useBlobUrl ? createBlobUrl(blob) : undefined;
    
    // Crear documento
    const documento: Documento = {
        id: Date.now(), // ID único basado en timestamp
        nombre: file.name,
        tamaño: blob.size,
        tipo,
        tipoId,
        fechaCarga: new Date().toISOString(),
        hash,
        comprimido: compressed,
        url,
        metadata: {
            originalSize: file.size,
            compressedSize: compressed ? blob.size : undefined,
            mimeType: file.type,
            lastModified: file.lastModified
        }
    };
    
    // Guardar en sessionStorage
    const storageKey = `${finalConfig.storageKeyPrefix}${rut.replace(/[^0-9kK]/g, '')}`;
    const stored = sessionStorage.getItem(storageKey);
    let documentos: Documento[] = [];
    
    if (stored) {
        try {
            documentos = JSON.parse(stored);
        } catch {
            documentos = [];
        }
    }
    
    // Reemplazar documento existente del mismo tipo o agregar nuevo
    const existingIndex = documentos.findIndex(doc => doc.tipoId === tipoId);
    if (existingIndex >= 0) {
        // Revocar URL anterior si existe
        if (documentos[existingIndex].url) {
            revokeBlobUrl(documentos[existingIndex].url!);
        }
        documentos[existingIndex] = documento;
    } else {
        documentos.push(documento);
    }
    
    sessionStorage.setItem(storageKey, JSON.stringify(documentos));
    
    return documento;
};

// Función para obtener archivos almacenados
export const getFilesFromStorage = (rut: string): Documento[] => {
    const config = DEFAULT_CONFIG;
    const storageKey = `${config.storageKeyPrefix}${rut.replace(/[^0-9kK]/g, '')}`;
    const stored = sessionStorage.getItem(storageKey);
    
    if (!stored) return [];
    
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

// Función para obtener archivo específico por tipo
export const getFileByType = (rut: string, tipoId: number): Documento | null => {
    const documentos = getFilesFromStorage(rut);
    return documentos.find(doc => doc.tipoId === tipoId) || null;
};

// Función para eliminar archivo específico
export const removeFileFromStorage = (rut: string, tipoId: number): boolean => {
    const config = DEFAULT_CONFIG;
    const storageKey = `${config.storageKeyPrefix}${rut.replace(/[^0-9kK]/g, '')}`;
    const stored = sessionStorage.getItem(storageKey);
    
    if (!stored) return false;
    
    try {
        const documentos: Documento[] = JSON.parse(stored);
        const index = documentos.findIndex(doc => doc.tipoId === tipoId);
        
        if (index >= 0) {
            // Revocar URL si existe
            if (documentos[index].url) {
                revokeBlobUrl(documentos[index].url!);
            }
            
            documentos.splice(index, 1);
            sessionStorage.setItem(storageKey, JSON.stringify(documentos));
            return true;
        }
    } catch (error) {
        console.error('Error al eliminar archivo:', error);
    }
    
    return false;
};

// Función para limpiar todos los archivos de un RUT
export const clearAllFiles = (rut: string): void => {
    const config = DEFAULT_CONFIG;
    const storageKey = `${config.storageKeyPrefix}${rut.replace(/[^0-9kK]/g, '')}`;
    const stored = sessionStorage.getItem(storageKey);
    
    if (stored) {
        try {
            const documentos: Documento[] = JSON.parse(stored);
            // Revocar todas las URLs
            documentos.forEach(doc => {
                if (doc.url) {
                    revokeBlobUrl(doc.url);
                }
            });
        } catch (error) {
            console.error('Error al limpiar archivos:', error);
        }
    }
    
    sessionStorage.removeItem(storageKey);
};

// Función para obtener estadísticas de almacenamiento
export const getStorageStats = (rut: string): {
    totalFiles: number;
    totalSize: number;
    maxSize: number;
    percentageUsed: number;
} => {
    const config = DEFAULT_CONFIG;
    const documentos = getFilesFromStorage(rut);
    const totalSize = documentos.reduce((total, doc) => total + doc.tamaño, 0);
    
    return {
        totalFiles: documentos.length,
        totalSize,
        maxSize: config.maxTotalSize,
        percentageUsed: (totalSize / config.maxTotalSize) * 100
    };
};

// Función para validar integridad de archivos
export const validateFileIntegrity = async (documento: Documento, file: File): Promise<boolean> => {
    const currentHash = await generateFileHash(file);
    return currentHash === documento.hash;
};
