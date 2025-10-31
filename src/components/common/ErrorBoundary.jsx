import React from 'react';

/**
 * Error Boundary Component
 * Captura errores de JavaScript en cualquier parte del árbol de componentes hijo
 * Registra esos errores y muestra una UI de respaldo
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el próximo render muestre la UI de respaldo
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error en un servicio de reporte de errores
    console.error('💥 Error capturado por Error Boundary:', error);
    console.error('📋 Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Aquí puedes enviar el error a un servicio como Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // UI de respaldo personalizada
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="card text-center">
              {/* Icono de error */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-danger-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-danger-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Mensaje */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Algo salió mal!
              </h2>
              <p className="text-gray-600 mb-6">
                Lo sentimos, ocurrió un error inesperado. El error ha sido registrado y lo investigaremos.
              </p>

              {/* Detalles del error (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Detalles técnicos del error
                  </summary>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-60">
                    <p className="text-sm text-danger-600 font-mono mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-primary"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn-outline"
                >
                  Volver al inicio
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Si el problema persiste, contacta al soporte técnico.
            </div>
          </div>
        </div>
      );
    }

    // No hay error, renderizar children normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
