import React from 'react';

/**
 * Componente de imagen para tabla de artículos.
 * La imagen se ajusta al 100% del ancho de la celda (nunca sobresale a la columna NOMBRE).
 */
export function ArticuloImagenTable({ imagen_url, nombre }) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="w-full max-w-full h-[72px] flex items-center justify-center overflow-hidden mx-auto">
      {imagen_url && (
        <img
          src={imagen_url}
          alt={nombre}
          className={`max-w-full max-h-full w-auto h-auto object-contain block ${imgError ? 'hidden' : ''}`}
          onError={() => setImgError(true)}
        />
      )}
      {(!imagen_url || imgError) && (
        <div className="w-full h-full min-h-[56px] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <span className="text-[10px] text-slate-400 font-medium text-center">SIN IMAGEN</span>
        </div>
      )}
    </div>
  );
}

