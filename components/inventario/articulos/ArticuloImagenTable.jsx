import Image from 'next/image';

/**
 * Componente de imagen para tabla de artículos
 * Muestra imagen del artículo con bordes redondeados
 * La imagen usa object-contain para verse completa sin cortarse
 */
export function ArticuloImagenTable({ imagen_url, nombre }) {
  return (
    <div style={{ width: '100px', height: '100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {imagen_url ? (
        <img
          src={imagen_url}
          alt={nombre}
          style={{
            borderRadius: '0px',
            width: '100px',
            height: '100px',
            objectFit: 'contain',
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div style="width: 100px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 0px; background: linear-gradient(to bottom right, rgb(241 245 249), rgb(226 232 240)); margin: 0 auto;"><span style="font-size: 10px; color: rgb(148 163 184); font-weight: 500; text-align: center;">SIN IMAGEN</span></div>';
          }}
        />
      ) : (
        <div 
          style={{ 
            borderRadius: '0px', 
            width: '100px', 
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, rgb(241 245 249), rgb(226 232 240))'
          }}
        >
          <span style={{ fontSize: '10px', color: 'rgb(148 163 184)', fontWeight: '500', textAlign: 'center' }}>SIN IMAGEN</span>
        </div>
      )}
    </div>
  );
}

