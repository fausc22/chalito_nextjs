import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Package, RefreshCw, AlertTriangle } from 'lucide-react';
import { comandasService } from '../../services/comandasService';
import { getSufijoPresentacionCocina, getExtrasSinPresentacion } from '../../lib/extrasUtils';
import { pedidosService } from '../../services/pedidosService';
import { getPollingRemainingMs, isPollingBlocked, setPollingBlocked } from '../../services/rateLimitManager';

export function ModoCocina({ isOpen, onClose, modoCocina = true, onPedidoActualizado }) {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const erroresConsecutivosRef = useRef(0);
  const isActualizandoRef = useRef(false);

  // Cargar comandas en preparación
  const cargarComandas = useCallback(async (esManual = false) => {
    if (!isPolling && !esManual) return; // No cargar si el polling está deshabilitado (a menos que sea manual)

    if (!esManual && isPollingBlocked()) {
      setLoading(false);
      return;
    }
    
    if (isActualizandoRef.current && !esManual) return;
    
    setLoading(false);
    if (esManual) {
      isActualizandoRef.current = true;
    }
    // No limpiar el error inmediatamente si hay errores consecutivos
    if (erroresConsecutivosRef.current === 0) {
      setError(null);
    }
    try {
      const response = await comandasService.obtenerComandas({ estado: 'en_preparacion' });
      if (response.success) {
        // Si la carga fue exitosa, resetear contador de errores
        erroresConsecutivosRef.current = 0;
        // En modo cocina, optimizar: solo obtener info del pedido si es necesario
        // En modo encargado, obtener toda la info financiera
        // IMPORTANTE: Filtrar solo comandas cuyo pedido asociado tenga estado EN_PREPARACION
        // Usar Promise.allSettled para que si una comanda falla, las demás continúen
        const comandasConInfo = await Promise.allSettled(
          (response.data || []).map(async (comanda) => {
            try {
              // Agregar timeout a la llamada del pedido (5 segundos máximo)
              const pedidoPromise = pedidosService.obtenerPedidoPorId(comanda.pedidoId);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout obteniendo pedido')), 5000)
              );
              
              let pedidoResponse;
              try {
                pedidoResponse = await Promise.race([pedidoPromise, timeoutPromise]);
              } catch (timeoutError) {
                console.warn(`⏱️ Timeout obteniendo pedido ${comanda.pedidoId} para comanda ${comanda.id}`);
                return null; // Si hay timeout, excluir la comanda
              }
              
              if (!pedidoResponse || !pedidoResponse.success || !pedidoResponse.data) {
                console.warn(`⚠️ No se pudo obtener pedido ${comanda.pedidoId} para comanda ${comanda.id}`);
                return null; // Si no se puede obtener el pedido, excluir la comanda
              }
              
              const pedido = pedidoResponse.data;
              
              // Filtrar: solo incluir comandas cuyo pedido tenga estado EN_PREPARACION
              if (pedido.estado !== 'en_cocina') {
                return null; // Excluir comandas cuyo pedido no está en preparación
              }
              
              return {
                ...comanda,
                horaProgramada: pedido.horaProgramada || comanda.horarioEntrega || null
              };
            } catch (err) {
              console.warn(`⚠️ Error obteniendo pedido ${comanda.pedidoId} para comanda ${comanda.id}:`, err.message || err);
              return null; // Excluir comandas con error
            }
          })
        );
        // Filtrar los null y los que fueron rechazados (comandas excluidas)
        const comandasFiltradas = comandasConInfo
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => result.value);
        
        // Actualizar siempre con las comandas filtradas
        // Cuando se marca como lista manualmente, forzar la actualización
        setComandas(comandasFiltradas);
        
        setLoading(false);
      } else {
        const errorMsg = response.error || response.mensaje || 'Error al cargar comandas';
        const isRateLimit = response.rateLimit === true || response.status === 429 || 
                           errorMsg?.includes('Rate limit') || errorMsg?.includes('rate limit') || 
                           errorMsg?.toLowerCase().includes('rate limit');
        
        erroresConsecutivosRef.current += 1;
        const nuevosErrores = erroresConsecutivosRef.current;
        
        console.error(`❌ Error al cargar comandas (${nuevosErrores} errores consecutivos):`, errorMsg);
        
        // Si hay error de rate limit, manejar según el modo
        if (isRateLimit) {
          const { remainingMs } = setPollingBlocked({ retryAfterSeconds: response.retryAfter });
          const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
          console.warn(`🚫 Rate limit detectado. Polling pausado por ${remainingSeconds} segundos.`);

          erroresConsecutivosRef.current = Math.max(erroresConsecutivosRef.current, 5);
          setError(null);
          setLoading(false);
          return; // Salir temprano para no procesar más
        }
        
        // Verificar comandas existentes usando función de actualización
        setComandas(prevComandas => {
        if (prevComandas.length === 0 || nuevosErrores >= 3) {
          setError(errorMsg);
        }
        if (prevComandas.length > 0) {
          setError(null);
        } else {
          setTimeout(() => setError(null), 3000);
        }
        return prevComandas;
      });
    }
  } catch (err) {
      const errorMsg = err.message || 'Error al cargar comandas';
      const isRateLimit = err.response?.status === 429 || 
                         errorMsg?.includes('Rate limit') || errorMsg?.includes('rate limit') || 
                         errorMsg?.toLowerCase().includes('rate limit');
      
      erroresConsecutivosRef.current += 1;
      const nuevosErrores = erroresConsecutivosRef.current;
      
      console.error(`❌ Error al cargar comandas (catch, ${nuevosErrores} errores consecutivos):`, err);
      
      // Si hay error de rate limit, manejar según el modo
      if (isRateLimit) {
        const retryAfterHeader = err.response?.headers?.['retry-after'] || err.response?.headers?.['Retry-After'];
        const { remainingMs } = setPollingBlocked({ retryAfterHeader });
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        console.warn(`🚫 Rate limit detectado. Polling pausado por ${remainingSeconds} segundos.`);

        erroresConsecutivosRef.current = Math.max(erroresConsecutivosRef.current, 5);
        setError(null);
        setLoading(false);
        return; // Salir temprano pero sin reintentos automáticos
      }
      
      // Verificar comandas existentes usando función de actualización
      setComandas(prevComandas => {
        if (prevComandas.length === 0 || nuevosErrores >= 3) {
          setError(errorMsg);
        }
        if (prevComandas.length > 0) {
          setError(null);
        } else {
          setTimeout(() => setError(null), 3000);
        }
        return prevComandas;
      });
    } finally {
      setLoading(false);
      if (esManual) {
        isActualizandoRef.current = false;
      }
    }
  }, [isPolling]);

  useEffect(() => {
    if (isOpen) {
      const timeInterval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 30000);
      return () => clearInterval(timeInterval);
    }
  }, [isOpen]);

  // Guardar referencia estable de cargarComandas
  const cargarComandasRef = useRef(cargarComandas);
  useEffect(() => {
    cargarComandasRef.current = cargarComandas;
  }, [cargarComandas]);

  // Cargar comandas al abrir
  useEffect(() => {
    if (!isOpen) return;
    
    // Cargar inmediatamente al abrir
    cargarComandasRef.current();
    
    const baseInterval = 3000;
    
    const interval = setInterval(() => {
      if (isPolling) {
        let intervalMultiplier = 1;
        if (erroresConsecutivosRef.current > 3) {
          intervalMultiplier = Math.min(erroresConsecutivosRef.current / 3, 2);
        }
        // Solo ejecutar si no hay actualización manual en curso
        if (!isActualizandoRef.current) {
          cargarComandasRef.current();
        }
      }
    }, baseInterval);
    
    return () => clearInterval(interval);
  }, [isOpen, isPolling]);

  // Formatear tiempo transcurrido
  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaComanda = new Date(fecha);
    const diffMs = ahora - fechaComanda;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    
    const horas = Math.floor(diffMins / 60);
    const minutos = diffMins % 60;
    return `${horas}h ${minutos}m`;
  };

  // Formatear hora programada (formato 24 horas)
  const formatearHoraProgramada = (hora) => {
    if (!hora) return null;
    
    // Si ya es un string formateado (HH:MM), devolverlo tal cual
    if (typeof hora === 'string' && /^\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }
    
    // Si es un string con formato de fecha/hora, intentar parsearlo
    if (typeof hora === 'string') {
      // Intentar parsear como fecha ISO (formato: 2025-12-11 22:45:00 o 2025-12-11T22:45:00)
      if (hora.includes('-') && (hora.includes(' ') || hora.includes('T'))) {
        const fechaStr = hora.includes('T') ? hora : hora.replace(' ', 'T');
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
          // Formato 24 horas: HH:MM
          const horas = String(fecha.getHours()).padStart(2, '0');
          const minutos = String(fecha.getMinutes()).padStart(2, '0');
          return `${horas}:${minutos}`;
        }
      }
      // Si no es una fecha válida, devolver el string original si tiene formato de hora
      if (/^\d{1,2}:\d{2}/.test(hora)) {
        const partes = hora.split(':');
        if (partes.length >= 2) {
          const h = String(parseInt(partes[0], 10)).padStart(2, '0');
          const m = String(parseInt(partes[1], 10)).padStart(2, '0');
          return `${h}:${m}`;
        }
      }
      // Si tiene formato AM/PM, convertirlo a 24 horas
      const tieneAMPM = hora.includes('a. m.') || hora.includes('p. m.') || 
                        hora.includes('AM') || hora.includes('PM') ||
                        hora.includes('am') || hora.includes('pm');
      if (tieneAMPM) {
        const partes = hora.replace(/[ap]\.?\s*m\.?/i, '').trim().split(':');
        if (partes.length === 2) {
          let hora24 = parseInt(partes[0].trim(), 10);
          const minuto = parseInt(partes[1].trim(), 10);
          const esPM = hora.toLowerCase().includes('p');
          if (esPM && hora24 !== 12) {
            hora24 += 12;
          } else if (!esPM && hora24 === 12) {
            hora24 = 0;
          }
          return `${String(hora24).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
        }
      }
      return null;
    }
    
    // Si es un objeto Date
    if (hora instanceof Date) {
      if (!isNaN(hora.getTime())) {
        // Formato 24 horas: HH:MM
        const horas = String(hora.getHours()).padStart(2, '0');
        const minutos = String(hora.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
      }
      return null;
    }
    
    return null;
  };

  // Función para verificar si debe mostrar alerta
  const verificarAlerta = useCallback((comanda) => {
    const ahora = new Date(currentTime);
    const fechaComanda = new Date(comanda.fecha);
    const tiempoTranscurrido = (ahora - fechaComanda) / (1000 * 60); // minutos
    
    // Alerta 1: Si pasó más de 1 hora desde que se creó el pedido
    if (tiempoTranscurrido > 60) {
      return { tipo: 'tiempo_excedido', minutos: Math.floor(tiempoTranscurrido) };
    }
    
    // Alerta 2: Si hay hora programada y faltan 10-20 minutos
    const horaProgramada = comanda.horaProgramada || comanda.horarioEntrega;
    if (horaProgramada) {
      try {
        let horaObjetivo;
        
        // Intentar parsear la hora programada
        if (typeof horaProgramada === 'string') {
          // Formato ISO completo: 2025-12-11 22:45:00 o 2025-12-11T22:45:00
          if (horaProgramada.includes('-') && (horaProgramada.includes(' ') || horaProgramada.includes('T'))) {
            const fechaStr = horaProgramada.includes('T') ? horaProgramada : horaProgramada.replace(' ', 'T');
            horaObjetivo = new Date(fechaStr);
          } else if (/^\d{1,2}:\d{2}/.test(horaProgramada)) {
            // Formato HH:MM (24 horas)
            const partes = horaProgramada.split(':');
            if (partes.length >= 2) {
              const horas = parseInt(partes[0], 10);
              const minutos = parseInt(partes[1], 10);
              
              if (!isNaN(horas) && !isNaN(minutos) && horas >= 0 && horas < 24 && minutos >= 0 && minutos < 60) {
                horaObjetivo = new Date();
                horaObjetivo.setHours(horas, minutos, 0, 0);
                
                // Si la hora ya pasó hoy, asumir que es para mañana
                if (horaObjetivo < ahora) {
                  horaObjetivo.setDate(horaObjetivo.getDate() + 1);
                }
              } else {
                return null;
              }
            } else {
              return null;
            }
          } else {
            return null;
          }
        } else if (horaProgramada instanceof Date) {
          horaObjetivo = horaProgramada;
        } else {
          return null;
        }
        
        if (!horaObjetivo || isNaN(horaObjetivo.getTime())) {
          return null;
        }
        
        const minutosRestantes = (horaObjetivo.getTime() - ahora.getTime()) / (1000 * 60);
        
        // Si faltan entre 10 y 20 minutos
        if (minutosRestantes >= 10 && minutosRestantes <= 20) {
          return { tipo: 'falta_poco', minutos: Math.floor(minutosRestantes) };
        }
      } catch (error) {
        console.warn('Error calculando alerta de hora programada:', error, 'horaProgramada:', horaProgramada);
      }
    }
    
    return null;
  }, [currentTime]);

  return (
      <div className="w-full h-screen bg-slate-50 p-4 overflow-y-auto">
        {/* Header simple para cocina */}
        <div className="mb-4 pb-3 border-b-2 border-slate-300 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">COMANDAS EN PREPARACIÓN</h1>
          <span className="text-2xl font-bold text-slate-800">{comandas.length} ACTIVAS</span>
        </div>
        {loading && comandas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-slate-400 animate-spin" />
              <p className="text-slate-500">Cargando comandas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          </div>
        ) : comandas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-600">No hay comandas en preparación</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {comandas.map((comanda) => {
              const alerta = verificarAlerta(comanda);
              const tieneAlerta = alerta !== null;
              
              return (
                <Card
                  key={comanda.id}
                  className={`bg-white border-2 shadow-md ${
                    tieneAlerta 
                      ? 'border-red-500 animate-pulse' 
                      : 'border-slate-300'
                  }`}
                >
                  {/* Header: #pedido | Cuanto antes / Para HH:MM + nombre cliente */}
                  <div className={`p-4 ${
                    tieneAlerta 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-800 text-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xl">#{comanda.pedidoId}</span>
                      <span className="text-base font-semibold rounded-lg px-2 py-1 bg-white/20">
                        {comanda.horaProgramada && formatearHoraProgramada(comanda.horaProgramada)
                          ? `Para ${formatearHoraProgramada(comanda.horaProgramada)}`
                          : 'Cuanto antes'}
                      </span>
                    </div>
                    <p className="font-bold text-base">{comanda.clienteNombre}</p>
                    {tieneAlerta && (
                      <div className="mt-2 p-2 bg-red-700 rounded text-white text-sm font-bold">
                        {alerta.tipo === 'tiempo_excedido' 
                          ? `⚠️ Más de ${Math.floor(alerta.minutos / 60)}h en preparación`
                          : `⚠️ Faltan ${alerta.minutos} minutos`}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="p-3 space-y-2.5">
                    {comanda.articulos?.map((articulo, idx) => (
                      <div key={idx} className="border-l-4 border-slate-500 pl-2.5 py-1.5">
                        <p className="font-bold text-base text-slate-900">
                          {articulo.cantidad}x {(articulo.articuloNombre || '').toUpperCase()}{getSufijoPresentacionCocina(articulo.personalizaciones?.extras ?? []).toUpperCase()}
                        </p>
                        {/* Extras (sin presentación: Hacela doble/triple va en el nombre como medallones) */}
                        {(() => {
                          const extrasLista = getExtrasSinPresentacion(articulo.personalizaciones?.extras ?? []);
                          return extrasLista.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                              {extrasLista.map((extra, extraIdx) => (
                                <p key={extraIdx} className="text-sm font-medium text-slate-700 ml-2">
                                  + {(typeof extra === 'object' && (extra.nombre || extra.adicional_nombre || extra.name) ? (extra.nombre || extra.adicional_nombre || extra.name) : String(extra)).toUpperCase()}
                                </p>
                              ))}
                            </div>
                          );
                        })()}
                        {articulo.observaciones && (
                          <p className="text-sm font-medium text-slate-700 italic mt-1 ml-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            {String(articulo.observaciones || '').toUpperCase()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
}
