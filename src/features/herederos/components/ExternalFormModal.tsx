import * as ConsaludCore from '@consalud/core';
import React, { useEffect, useState } from 'react';

interface ExternalFormModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}

export const ExternalFormModal: React.FC<ExternalFormModalProps> = ({
  isOpen,
  url,
  onClose,
  onComplete,
  title = "Formulario Externo"
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer para mostrar tiempo transcurrido
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setTimeElapsed(0);
    }
  }, [isOpen]);

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Error al cargar el formulario externo');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <span className="text-sm text-gray-600">
              Tiempo: {formatTime(timeElapsed)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ConsaludCore.Button
              variant="outline"
              size="sm"
              onClick={onComplete}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              ✅ Completar
            </ConsaludCore.Button>
            <ConsaludCore.Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              ❌ Cancelar
            </ConsaludCore.Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando formulario...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <ConsaludCore.Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Recargar Página
                </ConsaludCore.Button>
              </div>
            </div>
          )}

          <iframe
            src={url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* Footer con instrucciones */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Instrucciones:</p>
              <p>1. Complete el formulario en el iframe</p>
              <p>2. Haga clic en "✅ Completar" cuando termine</p>
              <p>3. O haga clic en "❌ Cancelar" para salir</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Esta ventana se cerrará automáticamente</p>
              <p>después de 10 minutos por seguridad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
