import { useState, useEffect } from 'react';
import { Edit, Trash2, ChefHat, Check, Phone, Globe, MessageCircle, Store, Package, GripVertical, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function OrderCard({ pedido, onMarcharACocina, onListo, onEditar, onCancelar, onCobrar }) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado
    }
  });

  // Actualizar el tiempo cada 30 segundos para verificar si falta poco
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? 'none' : 'opacity 0.2s ease',
    cursor: isDragging ? 'grabbing' : 'grab',
    pointerEvents: isDragging ? 'none' : 'auto',
    willChange: isDragging ? 'transform' : 'auto'
  };

  const tiempoTranscurrido = () => {
    const minutos = Math.floor((Date.now() - pedido.timestamp) / 60000);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  // Función helper para formatear hora a formato 24 horas (HH:MM)
  const formatearHora24 = (hora) => {
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
      // Si es un string con formato HH:MM o H:MM, normalizarlo
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
      return hora; // Devolver original si no se puede parsear
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
    
    return hora;
  };

  const faltaPoco = () => {
    // Debug: verificar tipo de pedido
    if (pedido.tipo !== 'programado') {
      return false;
    }
    
    // Intentar obtener la hora programada desde diferentes campos
    const horaProgramada = pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega;
    
    // Debug: verificar si tiene hora programada
    if (!horaProgramada) {
      return false;
    }
    
    try {
      let horaObjetivo;
      
      // Verificar si viene en formato ISO completo (2025-12-11 22:45:00 o 2025-12-11T22:45:00)
      if (horaProgramada.includes('-') && (horaProgramada.includes(' ') || horaProgramada.includes('T'))) {
        // Formato ISO completo: 2025-12-11 22:45:00 o 2025-12-11T22:45:00
        const fechaStr = horaProgramada.includes('T') ? horaProgramada : horaProgramada.replace(' ', 'T');
        horaObjetivo = new Date(fechaStr);
      } else {
        // Formato HH:MM a. m./p. m. o HH:MM
        let hora24 = 0;
        let minuto = 0;
        
        // Detectar si tiene formato de 12 horas (a. m./p. m.)
        const tieneAMPM = horaProgramada.includes('a. m.') || horaProgramada.includes('p. m.') || 
                          horaProgramada.includes('AM') || horaProgramada.includes('PM') ||
                          horaProgramada.includes('am') || horaProgramada.includes('pm');
        
        if (tieneAMPM) {
          // Formato: "10:30 p. m." o "10:30 PM"
          const partes = horaProgramada.replace(/[ap]\.?\s*m\.?/i, '').trim().split(':');
          if (partes.length !== 2) return false;
          
          hora24 = parseInt(partes[0].trim(), 10);
          minuto = parseInt(partes[1].trim(), 10);
          
          // Convertir a formato 24 horas
          const esPM = horaProgramada.toLowerCase().includes('p');
          if (esPM && hora24 !== 12) {
            hora24 += 12;
          } else if (!esPM && hora24 === 12) {
            hora24 = 0;
          }
        } else {
          // Formato HH:MM (24 horas)
          const partes = horaProgramada.split(':');
          if (partes.length !== 2) return false;
          
          hora24 = parseInt(partes[0].trim(), 10);
          minuto = parseInt(partes[1].trim(), 10);
        }
        
        if (isNaN(hora24) || isNaN(minuto)) return false;
        
        horaObjetivo = new Date();
        horaObjetivo.setHours(hora24, minuto, 0, 0);
        
        // Si la hora programada ya pasó hoy, asumir que es para mañana
        if (horaObjetivo < new Date()) {
          horaObjetivo.setDate(horaObjetivo.getDate() + 1);
        }
      }
      
      // Validar que la fecha sea válida
      if (isNaN(horaObjetivo.getTime())) {
        return false;
      }
      
      const diferencia = (horaObjetivo.getTime() - currentTime) / 60000; // Diferencia en minutos
      
      // Activar cuando falten entre 10 y 15 minutos
      const faltaPoco = diferencia <= 15 && diferencia >= 10;
      
      if (faltaPoco) {
        console.log(`⚠️ Pedido #${pedido.id}: FALTA POCO! Faltan ${diferencia.toFixed(1)} minutos`);
      }
      
      return faltaPoco;
    } catch (error) {
      console.error(`Pedido #${pedido.id}: Error calculando tiempo programado:`, error, horaProgramada);
      return false;
    }
  };
  
  // Calcular si falta poco (se recalcula en cada render)
  const faltaPocoResult = faltaPoco();

  const IconoOrigen = () => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-slate-600" />;
      case 'web': return <Globe className="h-4 w-4 text-slate-600" />;
      case 'telefono': return <Phone className="h-4 w-4 text-slate-600" />;
      case 'mostrador': return <Store className="h-4 w-4 text-slate-600" />;
      default: return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 shadow-sm hover:shadow-md transition-all border border-slate-300 flex flex-col ${isDragging ? 'select-none' : ''}`}
    >
      <CardHeader className="pb-2 pt-3 px-3 bg-slate-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <GripVertical className="h-4 w-4 text-slate-600 hover:text-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
                <IconoOrigen />
                {pedido.tipoEntrega === 'delivery' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold">
                    DELIVERY
                  </Badge>
                )}
                {pedido.tipoEntrega === 'retiro' && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold">
                    RETIRO
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
            </div>
          </div>

          <div className={`text-right flex-shrink-0 ${faltaPocoResult ? 'bg-red-200 border-2 border-red-500 animate-pulse' : 'bg-slate-200 border border-slate-400'} px-2 py-1 rounded text-[10px]`}>
            {pedido.tipo === 'ya' ? (
              <div>
                <p className="text-[10px] text-slate-700 font-medium">Creado</p>
                <p className="text-xs font-bold text-slate-900">{tiempoTranscurrido()}</p>
              </div>
            ) : (
              <div>
                <p className={`text-[10px] font-medium ${faltaPocoResult ? 'text-red-700' : 'text-slate-700'}`}>Para</p>
                <p className={`text-xs font-bold ${faltaPocoResult ? 'text-red-900' : 'text-slate-900'}`}>
                  {formatearHora24(pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega) || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-3 pb-3 flex flex-col flex-grow">
        <div className="mb-2 bg-white rounded p-2 border border-slate-200">
          <ul className="space-y-1">
            {pedido.items.slice(0, 2).map((item, idx) => (
              <li key={idx} className="text-xs text-slate-800">
                <span className="font-bold text-slate-900">{item.cantidad}x</span> <span className="font-semibold">{item.nombre}</span>
              </li>
            ))}
            {pedido.items.length > 2 && (
              <li className="text-xs text-slate-600 font-semibold">
                +{pedido.items.length - 2} más...
              </li>
            )}
          </ul>
        </div>

        {/* Spacer para empujar el badge y botones al final */}
        <div className="flex-grow"></div>

        <div className="mb-2">
          {pedido.paymentStatus === 'paid' ? (
            <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              ✓ PAGADO
            </Badge>
          ) : (
            <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          {/* Fila 1: MARCHAR/LISTO/COBRAR + IMPRIMIR + EDITAR + ELIMINAR */}
          <div className="flex gap-1.5 w-full overflow-hidden">
            {pedido.estado === 'recibido' && (
              <Button
                onClick={(e) => {
                  const button = e.currentTarget;
                  button.disabled = true;
                  onMarcharACocina(pedido.id);
                  // Re-habilitar después de 2 segundos para evitar múltiples clics
                  setTimeout(() => {
                    button.disabled = false;
                  }, 2000);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
                size="sm"
                style={{ flex: '1 1 0%', maxWidth: '100%' }}
              >
                <span className="whitespace-nowrap">MARCHAR</span>
              </Button>
            )}
            {pedido.estado === 'en_cocina' && (
              <Button
                onClick={(e) => {
                  const button = e.currentTarget;
                  button.disabled = true;
                  onListo(pedido.id);
                  // Re-habilitar después de 2 segundos para evitar múltiples clics
                  setTimeout(() => {
                    button.disabled = false;
                  }, 2000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
                size="sm"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                LISTO
              </Button>
            )}
            {/* COBRAR cuando está entregado y pendiente - se expande para ocupar el ancho disponible */}
            {pedido.estado === 'entregado' && pedido.paymentStatus === 'pending' && onCobrar && (
              <Button
                onClick={() => onCobrar(pedido)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs h-8 min-w-0"
                size="sm"
              >
                <Package className="h-3.5 w-3.5 mr-1" />
                COBRAR
              </Button>
            )}
            <Button
              onClick={() => {
                // TODO: Implementar impresión de factura/ticket para cliente
                console.log('Imprimir factura/ticket:', pedido.id);
              }}
              variant="outline"
              className="border border-slate-300 hover:bg-slate-100 h-8 flex-shrink-0"
              size="sm"
              title="Imprimir factura/ticket"
              style={{ minWidth: '32px', padding: '0 8px' }}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => onEditar(pedido)}
              variant="outline"
              className="border border-slate-300 hover:bg-slate-100 h-8 flex-shrink-0"
              size="sm"
              style={{ minWidth: '32px', padding: '0 8px' }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => onCancelar(pedido)}
              variant="outline"
              className="border border-red-300 hover:bg-red-50 text-red-600 h-8 flex-shrink-0"
              size="sm"
              style={{ minWidth: '32px', padding: '0 8px' }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Fila 2: COBRAR (solo si NO está entregado) + ELIMINAR */}
          {pedido.estado !== 'entregado' && (
            <div className="flex gap-1.5">
              {pedido.paymentStatus === 'pending' && onCobrar && (
                <Button
                  onClick={() => onCobrar(pedido)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs h-8"
                  size="sm"
                  style={{ flex: '1.25' }}
                >
                  <Package className="h-3.5 w-3.5 mr-1" />
                  COBRAR
                </Button>
              )}
              {(!pedido.paymentStatus || pedido.paymentStatus === 'paid' || !onCobrar) && (
                <div style={{ flex: '1.25' }}></div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente OrderCardGhost - Versión estática para DragOverlay
 * Copia exacta de OrderCard pero sin interactividad y con estilos visuales diferenciados
 */
export function OrderCardGhost({ pedido }) {
  const [currentTime] = useState(Date.now());

  const tiempoTranscurrido = () => {
    const minutos = Math.floor((Date.now() - pedido.timestamp) / 60000);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  // Función helper para formatear hora a formato 24 horas (HH:MM)
  const formatearHora24 = (hora) => {
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
      // Si es un string con formato HH:MM o H:MM, normalizarlo
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
      return hora; // Devolver original si no se puede parsear
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
    
    return hora;
  };

  const faltaPoco = () => {
    if (pedido.tipo !== 'programado') {
      return false;
    }
    
    const horaProgramada = pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega;
    
    if (!horaProgramada) {
      return false;
    }
    
    try {
      let horaObjetivo;
      
      if (horaProgramada.includes('-') && (horaProgramada.includes(' ') || horaProgramada.includes('T'))) {
        const fechaStr = horaProgramada.includes('T') ? horaProgramada : horaProgramada.replace(' ', 'T');
        horaObjetivo = new Date(fechaStr);
      } else {
        let hora24 = 0;
        let minuto = 0;
        
        const tieneAMPM = horaProgramada.includes('a. m.') || horaProgramada.includes('p. m.') || 
                          horaProgramada.includes('AM') || horaProgramada.includes('PM') ||
                          horaProgramada.includes('am') || horaProgramada.includes('pm');
        
        if (tieneAMPM) {
          const partes = horaProgramada.replace(/[ap]\.?\s*m\.?/i, '').trim().split(':');
          if (partes.length !== 2) return false;
          
          hora24 = parseInt(partes[0].trim(), 10);
          minuto = parseInt(partes[1].trim(), 10);
          
          const esPM = horaProgramada.toLowerCase().includes('p');
          if (esPM && hora24 !== 12) {
            hora24 += 12;
          } else if (!esPM && hora24 === 12) {
            hora24 = 0;
          }
        } else {
          const partes = horaProgramada.split(':');
          if (partes.length !== 2) return false;
          
          hora24 = parseInt(partes[0].trim(), 10);
          minuto = parseInt(partes[1].trim(), 10);
        }
        
        if (isNaN(hora24) || isNaN(minuto)) return false;
        
        horaObjetivo = new Date();
        horaObjetivo.setHours(hora24, minuto, 0, 0);
        
        if (horaObjetivo < new Date()) {
          horaObjetivo.setDate(horaObjetivo.getDate() + 1);
        }
      }
      
      if (isNaN(horaObjetivo.getTime())) {
        return false;
      }
      
      const diferencia = (horaObjetivo.getTime() - currentTime) / 60000;
      return diferencia <= 15 && diferencia >= 10;
    } catch (error) {
      return false;
    }
  };
  
  const faltaPocoResult = faltaPoco();

  const IconoOrigen = () => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-slate-600" />;
      case 'web': return <Globe className="h-4 w-4 text-slate-600" />;
      case 'telefono': return <Phone className="h-4 w-4 text-slate-600" />;
      case 'mostrador': return <Store className="h-4 w-4 text-slate-600" />;
      default: return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <Card className="mb-2 shadow-lg border-2 border-blue-400 flex flex-col pointer-events-none select-none">
      <CardHeader className="pb-2 pt-3 px-3 bg-slate-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <GripVertical className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
                <IconoOrigen />
                {pedido.tipoEntrega === 'delivery' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold">
                    DELIVERY
                  </Badge>
                )}
                {pedido.tipoEntrega === 'retiro' && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold">
                    RETIRO
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
            </div>
          </div>

          <div className={`text-right flex-shrink-0 ${faltaPocoResult ? 'bg-red-200 border-2 border-red-500 animate-pulse' : 'bg-slate-200 border border-slate-400'} px-2 py-1 rounded text-[10px]`}>
            {pedido.tipo === 'ya' ? (
              <div>
                <p className="text-[10px] text-slate-700 font-medium">Creado</p>
                <p className="text-xs font-bold text-slate-900">{tiempoTranscurrido()}</p>
              </div>
            ) : (
              <div>
                <p className={`text-[10px] font-medium ${faltaPocoResult ? 'text-red-700' : 'text-slate-700'}`}>Para</p>
                <p className={`text-xs font-bold ${faltaPocoResult ? 'text-red-900' : 'text-slate-900'}`}>
                  {formatearHora24(pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega) || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-3 pb-3 flex flex-col flex-grow">
        <div className="mb-2 bg-white rounded p-2 border border-slate-200">
          <ul className="space-y-1">
            {pedido.items.slice(0, 2).map((item, idx) => (
              <li key={idx} className="text-xs text-slate-800">
                <span className="font-bold text-slate-900">{item.cantidad}x</span> <span className="font-semibold">{item.nombre}</span>
              </li>
            ))}
            {pedido.items.length > 2 && (
              <li className="text-xs text-slate-600 font-semibold">
                +{pedido.items.length - 2} más...
              </li>
            )}
          </ul>
        </div>

        {/* Spacer para empujar el badge y botones al final */}
        <div className="flex-grow"></div>

        <div className="mb-2">
          {pedido.paymentStatus === 'paid' ? (
            <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              ✓ PAGADO
            </Badge>
          ) : (
            <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          {/* Fila 1: MARCHAR/LISTO/COBRAR + IMPRIMIR + EDITAR + ELIMINAR */}
          <div className="flex gap-1.5 w-full overflow-hidden">
            {pedido.estado === 'recibido' && (
              <Button
                disabled
                className="bg-blue-600 text-white font-semibold text-xs h-8 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 pointer-events-none"
                size="sm"
                style={{ flex: '1 1 0%', maxWidth: '100%' }}
              >
                <span className="whitespace-nowrap">MARCHAR</span>
              </Button>
            )}
            {pedido.estado === 'en_cocina' && (
              <Button
                disabled
                className="flex-1 bg-blue-600 text-white font-semibold text-xs h-8 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 pointer-events-none"
                size="sm"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                LISTO
              </Button>
            )}
            {pedido.estado === 'entregado' && pedido.paymentStatus === 'pending' && (
              <Button
                disabled
                className="flex-1 bg-green-600 text-white font-semibold text-xs h-8 min-w-0 pointer-events-none"
                size="sm"
              >
                <Package className="h-3.5 w-3.5 mr-1" />
                COBRAR
              </Button>
            )}
            <Button
              disabled
              variant="outline"
              className="border border-slate-300 h-8 flex-shrink-0 pointer-events-none"
              size="sm"
              style={{ minWidth: '32px', padding: '0 8px' }}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button
              disabled
              variant="outline"
              className="border border-slate-300 h-8 flex-shrink-0 pointer-events-none"
              size="sm"
              style={{ minWidth: '32px', padding: '0 8px' }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              disabled
              variant="outline"
              className="border border-red-300 text-red-600 h-8 flex-shrink-0 pointer-events-none"
              size="sm"
              style={{ minWidth: '32px', padding: '0 8px' }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Fila 2: COBRAR (solo si NO está entregado) */}
          {pedido.estado !== 'entregado' && (
            <div className="flex gap-1.5">
              {pedido.paymentStatus === 'pending' && (
                <Button
                  disabled
                  className="bg-green-600 text-white font-semibold text-xs h-8 pointer-events-none"
                  size="sm"
                  style={{ flex: '1.25' }}
                >
                  <Package className="h-3.5 w-3.5 mr-1" />
                  COBRAR
                </Button>
              )}
              {(!pedido.paymentStatus || pedido.paymentStatus === 'paid') && (
                <div style={{ flex: '1.25' }}></div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

