import { Check } from 'lucide-react';

export function ModalTimeline({ pasoActual, totalPasos = 3 }) {
  const pasos = [
    { numero: 1, nombre: 'Armar Pedido' },
    { numero: 2, nombre: 'Datos Cliente' },
    { numero: 3, nombre: 'Resumen' }
  ];

  return (
    <div className="w-[60%] py-4">
      <div className="flex items-center justify-between relative">
        {/* Línea de progreso */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((pasoActual - 1) / (totalPasos - 1)) * 100}%` }}
          />
        </div>

        {/* Pasos */}
        {pasos.map((paso, index) => {
          const estaCompletado = paso.numero < pasoActual;
          const esActual = paso.numero === pasoActual;
          
          return (
            <div key={paso.numero} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${
                    estaCompletado
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : esActual
                        ? 'bg-white border-blue-600 text-blue-600'
                        : 'bg-white border-slate-300 text-slate-400'
                  }
                `}
              >
                {estaCompletado ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-bold text-sm">{paso.numero}</span>
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium text-center
                  ${esActual ? 'text-blue-600' : estaCompletado ? 'text-slate-600' : 'text-slate-400'}
                `}
              >
                {paso.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}





