import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Package, CheckCircle, X, RefreshCw, XCircle, MapPin, Phone, DollarSign, Monitor, Printer } from 'lucide-react';
import { comandasService } from '../../services/comandasService';
import { pedidosService } from '../../services/pedidosService';
import { toast } from '@/hooks/use-toast';

export function ModoCocina({ isOpen, onClose, modoCocina = false, onPedidoActualizado }) {
  // modoCocina: true = vista para pantalla de cocina (sin controles)
  // modoCocina: false = vista para encargado (con controles y más info)
  // onPedidoActualizado: callback para actualizar el pedido en la lista principal
  
  const router = useRouter();
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(!modoCocina); // En modo cocina, empezar sin loading
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [comandaAListar, setComandaAListar] = useState(null);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const erroresConsecutivosRef = useRef(0);
  const isActualizandoRef = useRef(false);

  // Cargar comandas en preparación
  const cargarComandas = useCallback(async (esManual = false) => {
    if (!isPolling && !esManual) return; // No cargar si el polling está deshabilitado (a menos que sea manual)
    
    // Si ya se está actualizando, no hacer otra llamada
    if (isActualizandoRef.current && !esManual) return;
    
    // En modo cocina, no mostrar loading para evitar parpadeos constantes
    // Pero asegurarse de limpiar el loading si está activo
    if (!modoCocina) {
      setLoading(true);
    } else {
      // En modo cocina, asegurarse de que el loading esté desactivado
      setLoading(false);
    }
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
              
              if (modoCocina) {
                // En modo cocina, solo obtener hora programada si no está en la comanda
                return {
                  ...comanda,
                  horaProgramada: pedido.horaProgramada || comanda.horarioEntrega || null
                };
              } else {
                // En modo encargado, obtener toda la info financiera
                return {
                  ...comanda,
                  total: pedido.total || 0,
                  subtotal: pedido.subtotal || 0,
                  ivaTotal: pedido.ivaTotal || 0,
                  descuento: pedido.descuento || 0,
                  horaProgramada: pedido.horaProgramada || comanda.horarioEntrega || null
                };
              }
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
        
        // Asegurarse de limpiar el loading en modo cocina también
        if (modoCocina) {
          setLoading(false);
        }
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
          const retryAfter = (response.retryAfter || 300) * 1000; // Convertir a milisegundos
          console.warn(`🚫 Rate limit detectado. ${modoCocina ? 'Ralentizando polling' : 'Deteniendo polling'} por ${retryAfter / 1000} segundos...`);
          
          // En modo cocina, NO detener el polling completamente, solo aumentar el intervalo temporalmente
          if (modoCocina) {
            // En modo cocina, aumentar el intervalo pero mantener el polling activo
            erroresConsecutivosRef.current = 5; // Aumentar errores para ralentizar, pero no detener
            setError(null); // No mostrar error en modo cocina para no bloquear la vista
            setLoading(false); // Asegurarse de limpiar el loading
            // Mantener las comandas existentes si las hay
            setComandas(prevComandas => prevComandas);
            // El polling continuará pero con intervalo más largo debido a erroresConsecutivosRef
            return; // Salir temprano pero sin detener el polling
          } else {
            // En modo encargado, detener el polling completamente
            setIsPolling(false);
            setError(`Rate limit excedido. Esperando ${Math.round(retryAfter / 1000 / 60)} minutos antes de reintentar...`);
            erroresConsecutivosRef.current = 10; // Máximo para evitar más intentos
            setTimeout(() => {
              setIsPolling(true);
              erroresConsecutivosRef.current = 0;
              setError(null);
              console.log('✅ Reanudando polling después de rate limit');
            }, retryAfter);
          }
          return; // Salir temprano para no procesar más
        }
        
        // Verificar comandas existentes usando función de actualización
        setComandas(prevComandas => {
          // Solo mostrar error si no hay comandas cargadas o si hay muchos errores consecutivos
          if (prevComandas.length === 0 || nuevosErrores >= 3) {
            setError(errorMsg);
          }
          
          // En modo cocina, mantener comandas existentes y no bloquear la vista
          if (modoCocina && prevComandas.length > 0) {
            // No mostrar error si ya hay comandas cargadas
            setError(null);
          } else if (modoCocina) {
            // Limpiar el error después de 3 segundos en modo cocina
            setTimeout(() => setError(null), 3000);
          }
          
          return prevComandas; // Mantener comandas existentes
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
        const retryAfter = (err.response?.headers?.['retry-after'] || 300) * 1000; // Convertir a milisegundos
        console.warn(`🚫 Rate limit detectado. ${modoCocina ? 'Ralentizando polling' : 'Deteniendo polling'} por ${retryAfter / 1000} segundos...`);
        
        // En modo cocina, NO detener el polling completamente, solo aumentar el intervalo temporalmente
        if (modoCocina) {
          // En modo cocina, aumentar el intervalo pero mantener el polling activo
          erroresConsecutivosRef.current = 5; // Aumentar errores para ralentizar, pero no detener
          setError(null); // No mostrar error en modo cocina para no bloquear la vista
          setLoading(false); // Asegurarse de limpiar el loading
          // Mantener las comandas existentes si las hay
          setComandas(prevComandas => prevComandas);
          // El polling continuará pero con intervalo más largo debido a erroresConsecutivosRef
          return; // Salir temprano pero sin detener el polling
        } else {
          // En modo encargado, ralentizar el polling pero no detenerlo completamente
          // Solo aumentar el intervalo temporalmente
          erroresConsecutivosRef.current = 5; // Aumentar errores para ralentizar
          setError(null); // No mostrar error para no bloquear la vista
          setLoading(false); // Asegurarse de limpiar el loading
          // Mantener las comandas existentes si las hay
          setComandas(prevComandas => prevComandas);
          // El polling continuará pero con intervalo más largo
          return; // Salir temprano pero sin detener el polling
        }
      }
      
      // Verificar comandas existentes usando función de actualización
      setComandas(prevComandas => {
        // Solo mostrar error si no hay comandas cargadas o si hay muchos errores consecutivos
        if (prevComandas.length === 0 || nuevosErrores >= 3) {
          setError(errorMsg);
        }
        
        // En modo cocina, mantener comandas existentes y no bloquear la vista
        if (modoCocina && prevComandas.length > 0) {
          // No mostrar error si ya hay comandas cargadas
          setError(null);
        } else if (modoCocina) {
          // Limpiar el error después de 3 segundos en modo cocina
          setTimeout(() => setError(null), 3000);
        }
        
        return prevComandas; // Mantener comandas existentes
      });
    } finally {
      if (!modoCocina) {
        setLoading(false);
      }
      // Siempre limpiar el estado de actualización cuando es manual
      if (esManual) {
        isActualizandoRef.current = false;
        // También limpiar loading en modo cocina si es manual para evitar que se quede cargando
        if (modoCocina) {
          setLoading(false);
        }
      }
    }
  }, [isPolling, modoCocina]);

  // Actualizar tiempo actual cada 30 segundos para recalcular alertas
  useEffect(() => {
    if (isOpen && modoCocina) {
      const timeInterval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 30000); // Actualizar cada 30 segundos
      return () => clearInterval(timeInterval);
    }
  }, [isOpen, modoCocina]);

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
    
    // Calcular intervalo: más frecuente en modo cocina para actualizaciones en tiempo real
    // Modo cocina: 3 segundos para actualizaciones casi instantáneas
    // Modo encargado: 30 segundos para evitar rate limiting
    const baseInterval = modoCocina ? 3000 : 30000;
    
    const interval = setInterval(() => {
      if (isPolling) {
        // En modo cocina, aplicar backoff mínimo solo si hay muchos errores (para rate limit)
        // En modo encargado, aplicar backoff exponencial completo
        let intervalMultiplier = 1;
        if (modoCocina && erroresConsecutivosRef.current > 3) {
          // En modo cocina, solo ralentizar ligeramente si hay rate limit (máximo 2x = 6 segundos)
          intervalMultiplier = Math.min(erroresConsecutivosRef.current / 3, 2);
        } else if (!modoCocina && erroresConsecutivosRef.current > 0) {
          // En modo encargado, aplicar backoff exponencial completo
          intervalMultiplier = Math.min(Math.pow(2, erroresConsecutivosRef.current), 8);
        }
        // Solo ejecutar si no hay actualización manual en curso
        if (!isActualizandoRef.current) {
          cargarComandasRef.current();
        }
      }
    }, baseInterval);
    
    return () => clearInterval(interval);
  }, [isOpen, isPolling, modoCocina]);

  // Marcar comanda como lista (cambiar a ENTREGADO)
  const marcarComandaLista = async (comandaId) => {
    setComandaAListar(comandaId);
  };

  const confirmarMarcarLista = async () => {
    if (!comandaAListar) return;
    
    try {
      // Buscar el pedidoId de la comanda
      const comanda = comandas.find(c => c.id === comandaAListar);
      if (!comanda) {
        toast.error('No se encontró la comanda');
        setComandaAListar(null);
        return;
      }

      // ACTUALIZACIÓN OPTIMISTA: Actualizar la UI inmediatamente
      // 1. Remover la comanda de la lista localmente (optimista)
      setComandas(prevComandas => prevComandas.filter(c => c.id !== comanda.id));
      
      // 2. Si hay callback para actualizar pedidos, actualizar también el pedido localmente
      if (onPedidoActualizado) {
        onPedidoActualizado(comanda.pedidoId, { estado: 'entregado' });
      }

      // 3. Actualizar en el backend (sin bloquear la UI, en background)
      // IMPORTANTE: Actualizar primero la comanda, luego el pedido SECUENCIALMENTE
      // para evitar condiciones de carrera
      const actualizarComanda = async () => {
        const comandaResponse = await comandasService.actualizarEstadoComanda(comanda.id, 'listo');
        
        if (!comandaResponse.success) {
          const isRateLimit = comandaResponse.rateLimit || comandaResponse.status === 429;
          
          if (isRateLimit) {
            // Si hay rate limit, reintentar después de un delay
            const retryAfter = (comandaResponse.retryAfter || 5) * 1000;
            console.warn(`⚠️ Rate limit al actualizar comanda. Reintentando en ${retryAfter / 1000} segundos...`);
            setTimeout(async () => {
              const retryResponse = await comandasService.actualizarEstadoComanda(comanda.id, 'listo');
              if (!retryResponse.success && !retryResponse.rateLimit) {
                console.error('❌ Error al actualizar comanda después de reintento:', retryResponse.error);
                toast.error('Error al actualizar estado de comanda. Por favor, verifica en la base de datos.');
              }
            }, retryAfter);
          } else {
            console.error('❌ Error al actualizar comanda:', comandaResponse.error);
            toast.error('Error al actualizar estado de comanda');
          }
        } else {
          console.log('✅ Comanda actualizada correctamente a LISTA');
        }
        
        return comandaResponse;
      };
      
      const actualizarPedido = async () => {
        // IMPORTANTE: Esperar un pequeño delay para asegurar que la comanda se actualizó primero
        // y evitar condiciones de carrera
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pedidoResponse = await pedidosService.actualizarEstadoPedido(comanda.pedidoId, 'entregado');
        
        if (!pedidoResponse.success) {
          const isRateLimit = pedidoResponse.rateLimit || pedidoResponse.status === 429;
          
          if (isRateLimit) {
            // Si hay rate limit, reintentar después de un delay
            const retryAfter = (pedidoResponse.retryAfter || 5) * 1000;
            console.warn(`⚠️ Rate limit al actualizar pedido. Reintentando en ${retryAfter / 1000} segundos...`);
            setTimeout(async () => {
              const retryResponse = await pedidosService.actualizarEstadoPedido(comanda.pedidoId, 'entregado');
              if (!retryResponse.success && !retryResponse.rateLimit) {
                console.error('❌ Error al actualizar pedido después de reintento:', retryResponse.error);
              }
            }, retryAfter);
          } else {
            console.error('❌ Error al actualizar pedido:', pedidoResponse.error);
          }
        } else {
          console.log('✅ Pedido actualizado correctamente a ENTREGADO');
        }
        
        return pedidoResponse;
      };
      
      // Ejecutar SECUENCIALMENTE: primero comanda, luego pedido
      actualizarComanda().then((comandaResponse) => {
        // Solo actualizar el pedido si la comanda se actualizó correctamente o si es rate limit
        if (comandaResponse.success || comandaResponse.rateLimit) {
          return actualizarPedido().then((pedidoResponse) => {
            return [comandaResponse, pedidoResponse];
          });
        } else {
          // Si la comanda falló y no es rate limit, no actualizar el pedido
          return [comandaResponse, { success: false, error: 'Comanda no actualizada' }];
        }
      }).then(([comandaResponse, pedidoResponse]) => {
        // Verificar si ambas actualizaciones fueron exitosas
        if (comandaResponse.success && pedidoResponse.success) {
          toast.success('Comanda marcada como lista');
        } else {
          // Si alguna falló pero no es rate limit, mostrar error
          const comandaIsRateLimit = comandaResponse.rateLimit || comandaResponse.status === 429;
          const pedidoIsRateLimit = pedidoResponse.rateLimit || pedidoResponse.status === 429;
          
          if (comandaIsRateLimit || pedidoIsRateLimit) {
            toast.success('Comanda marcada como lista (sincronización pendiente)');
          } else {
            // Si no es rate limit, puede haber un error real
            if (!comandaResponse.success) {
              console.error('❌ Error al actualizar comanda:', comandaResponse.error);
            }
            if (!pedidoResponse.success) {
              console.error('❌ Error al actualizar pedido:', pedidoResponse.error);
            }
            // No revertir la actualización optimista, pero recargar para sincronizar
            setTimeout(() => {
              cargarComandas(true);
            }, 2000);
          }
        }
      }).catch(error => {
        console.error('❌ Error al actualizar en backend:', error);
        // No revertir la actualización optimista, pero recargar para sincronizar
        setTimeout(() => {
          cargarComandas(true);
        }, 2000);
      });

      // Recargar comandas después de un breve delay para asegurar sincronización
      setTimeout(() => {
        cargarComandas(true);
      }, 500);
    } catch (error) {
      console.error('Error al marcar comanda como lista:', error);
      toast.error('Error al marcar comanda como lista');
      // Revertir: recargar comandas
      cargarComandas(true);
    } finally {
      setComandaAListar(null);
      // Asegurarse de limpiar el estado de actualización
      isActualizandoRef.current = false;
    }
  };

  // Cancelar pedido
  const cancelarPedido = async (pedidoId) => {
    setPedidoACancelar(pedidoId);
  };

  const confirmarCancelarPedido = async () => {
    if (!pedidoACancelar) return;
    
    try {
      const response = await pedidosService.actualizarEstadoPedido(pedidoACancelar, 'cancelado');
      if (response.success) {
        toast.success('Pedido cancelado correctamente');
        await cargarComandas();
      } else {
        toast.error(`Error: ${response.error || 'No se pudo cancelar el pedido'}`);
      }
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      toast.error('Error al cancelar el pedido');
    } finally {
      setPedidoACancelar(null);
    }
  };

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
        
        // Debug: mostrar información de la alerta
        if (minutosRestantes >= 0 && minutosRestantes <= 30) {
          console.log(`🔔 Comanda #${comanda.pedidoId}: Faltan ${Math.floor(minutosRestantes)} minutos (hora objetivo: ${horaObjetivo.toLocaleString()}, ahora: ${ahora.toLocaleString()})`);
        }
        
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

  // Vista para pantalla de cocina (sin controles, diseño simple)
  if (modoCocina) {
    return (
      <div className="w-full h-screen bg-slate-50 p-4 overflow-y-auto">
        {/* Header simple para cocina */}
        <div className="mb-4 pb-3 border-b-2 border-slate-300">
          <h1 className="text-2xl font-bold text-slate-800">Comandas en Preparación</h1>
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
                  {/* Header simple */}
                  <div className={`p-4 ${
                    tieneAlerta 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-800 text-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xl">#{comanda.pedidoId}</span>
                      <span className={`inline-flex items-center rounded-full border border-transparent text-white text-xs font-semibold px-2.5 py-0.5 ${
                        tieneAlerta ? 'bg-red-700' : 'bg-slate-600'
                      }`}>
                        {comanda.modalidad === 'delivery' ? 'DELIVERY' : 'RETIRO'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 ${tieneAlerta ? 'text-white' : 'text-slate-300'}`}>
                        <Clock className="h-5 w-5" />
                        <span className="text-base font-semibold">Hace: {formatearTiempo(comanda.fecha)}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${tieneAlerta ? 'text-white' : 'text-slate-300'}`}>
                        <Clock className="h-5 w-5" />
                        <span className="text-base font-semibold">
                          Para: {comanda.horaProgramada && formatearHoraProgramada(comanda.horaProgramada) 
                            ? formatearHoraProgramada(comanda.horaProgramada) 
                            : 'Cuanto Antes'}
                        </span>
                      </div>
                      {tieneAlerta && (
                        <div className="mt-2 p-2 bg-red-700 rounded text-white text-sm font-bold">
                          {alerta.tipo === 'tiempo_excedido' 
                            ? `⚠️ Más de ${Math.floor(alerta.minutos / 60)}h en preparación`
                            : `⚠️ Faltan ${alerta.minutos} minutos`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="p-3 bg-slate-200 border-b border-slate-300">
                    <p className="font-bold text-base text-slate-900">{comanda.clienteNombre}</p>
                  </div>

                  {/* Items */}
                  <div className="p-3 space-y-2.5">
                    {comanda.articulos?.map((articulo, idx) => (
                      <div key={idx} className="border-l-4 border-slate-500 pl-2.5 py-1.5">
                        <p className="font-bold text-base text-slate-900">
                          {articulo.cantidad}x {articulo.articuloNombre}
                        </p>
                        {/* Extras */}
                        {articulo.personalizaciones?.extras && Array.isArray(articulo.personalizaciones.extras) && articulo.personalizaciones.extras.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {articulo.personalizaciones.extras.map((extra, extraIdx) => (
                              <p key={extraIdx} className="text-sm font-medium text-slate-700 ml-2">
                                + {extra.nombre || extra}
                              </p>
                            ))}
                          </div>
                        )}
                        {articulo.observaciones && (
                          <p className="text-sm font-medium text-slate-700 italic mt-1 ml-2">
                            📝 {articulo.observaciones}
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

  // Vista para encargado (con controles y más información)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 [&>button]:text-white [&>button]:hover:text-white [&>button]:opacity-100 [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0 [&>button]:focus:border-2 [&>button]:focus:border-white [&>button]:border-transparent">
        <DialogDescription className="sr-only">
          Vista de comandas en preparación para el encargado
        </DialogDescription>
        
        {/* Header con botones */}
        <div className="flex-shrink-0 bg-slate-800 text-white p-4 flex items-center justify-between pr-12">
          <DialogTitle className="text-xl font-bold">Modo Cocina - Vista Encargado</DialogTitle>
          <div className="flex items-center gap-3 mr-8">
            <Button
              onClick={() => router.push('/cocina')}
              variant="outline"
              size="sm"
              className="h-8 bg-white text-slate-800 hover:bg-slate-100"
            >
              <Monitor className="h-4 w-4 mr-1" />
              Vista Cocina
            </Button>
            <Button
              onClick={() => cargarComandas(true)}
              variant="outline"
              size="sm"
              disabled={loading || isActualizandoRef.current}
              className="h-8 bg-white text-slate-800 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading || isActualizandoRef.current ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Contenido */}
        {loading && comandas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-slate-400 animate-spin" />
              <p className="text-slate-500">Cargando comandas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => cargarComandas(true)} variant="outline" disabled={isActualizandoRef.current}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : comandas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-600">No hay comandas en preparación</p>
              <p className="text-sm text-slate-500 mt-2">Las comandas aparecerán aquí cuando los pedidos pasen a preparación</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comandas.map((comanda) => (
                <Card
                  key={comanda.id}
                  className="bg-white border-2 border-slate-300 shadow-lg"
                >
                  {/* Header */}
                  <div className="bg-slate-800 text-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <span className="font-bold text-lg">Pedido #{comanda.pedidoId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-slate-700 text-white"
                          onClick={() => {
                            // TODO: Implementar impresión de comanda para cocina
                            console.log('Imprimir comanda:', comanda.id);
                          }}
                          title="Imprimir comanda para cocina"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Badge className="bg-slate-600 text-white transition-none">
                          {comanda.modalidad === 'delivery' ? 'DELIVERY' : 'RETIRO'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Hace: {formatearTiempo(comanda.fecha)}</span>
                      <span className="ml-2">• Para: {comanda.horarioEntrega && formatearHoraProgramada(comanda.horarioEntrega) 
                        ? formatearHoraProgramada(comanda.horarioEntrega) 
                        : 'Cuanto Antes'}</span>
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <p className="font-bold text-base text-slate-900 mb-1">{comanda.clienteNombre}</p>
                    {comanda.clienteTelefono && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                        <Phone className="h-3 w-3" />
                        <span>{comanda.clienteTelefono}</span>
                      </div>
                    )}
                    {comanda.clienteDireccion && comanda.modalidad === 'delivery' && (
                      <div className="flex items-start gap-1 text-xs text-slate-600">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{comanda.clienteDireccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Artículos */}
                  <div className="p-3">
                    <div className="space-y-2">
                      {comanda.articulos?.map((articulo, idx) => (
                        <div key={idx} className="border-l-4 border-slate-400 pl-2 py-1">
                          <p className="font-bold text-sm text-slate-900">
                            {articulo.cantidad}x {articulo.articuloNombre}
                          </p>
                          {/* Extras */}
                          {articulo.personalizaciones?.extras && Array.isArray(articulo.personalizaciones.extras) && articulo.personalizaciones.extras.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {articulo.personalizaciones.extras.map((extra, extraIdx) => (
                                <p key={extraIdx} className="text-xs text-slate-600 ml-2">
                                  + {extra.nombre || extra}
                                </p>
                              ))}
                            </div>
                          )}
                          {articulo.observaciones && (
                            <p className="text-sm font-medium text-slate-700 italic mt-1 ml-2">
                              📝 {articulo.observaciones}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {comanda.observaciones && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs text-slate-600 italic">
                          <strong>Obs:</strong> {comanda.observaciones}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Total (solo encargado) */}
                  {comanda.total && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total:</span>
                        <span className="font-bold text-base text-slate-900">
                          ${comanda.total.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción (solo encargado) */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                    <Button
                      onClick={() => marcarComandaLista(comanda.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Lista
                    </Button>
                    <Button
                      onClick={() => cancelarPedido(comanda.pedidoId)}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Pedido
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>

      {/* AlertDialog para confirmar marcar como lista */}
      <AlertDialog open={comandaAListar !== null} onOpenChange={(open) => !open && setComandaAListar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar esta comanda como lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la comanda como entregada. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarMarcarLista} className="bg-green-600 hover:bg-green-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para confirmar cancelar pedido */}
      <AlertDialog open={pedidoACancelar !== null} onOpenChange={(open) => !open && setPedidoACancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará el pedido y no se podrá deshacer. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCancelarPedido} className="bg-red-600 hover:bg-red-700">
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
