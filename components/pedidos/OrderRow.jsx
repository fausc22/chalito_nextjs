import { useState, useEffect } from 'react';
import { Edit, Trash2, ChefHat, Check, Phone, Globe, MessageCircle, Store, Package, Printer, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function OrderRow({ pedido, onMarcharACocina, onListo, onEditar, onCancelar, onCobrar }) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado
    }
  });

  // Actualizar el tiempo cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
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

  const formatearHora24 = (hora) => {
    if (!hora) return null;
    
    if (typeof hora === 'string' && /^\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }
    
    if (typeof hora === 'string') {
      if (hora.includes('-') && (hora.includes(' ') || hora.includes('T'))) {
        const fechaStr = hora.includes('T') ? hora : hora.replace(' ', 'T');
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
          const horas = String(fecha.getHours()).padStart(2, '0');
          const minutos = String(fecha.getMinutes()).padStart(2, '0');
          return `${horas}:${minutos}`;
        }
      }
      if (/^\d{1,2}:\d{2}/.test(hora)) {
        const partes = hora.split(':');
        if (partes.length >= 2) {
          const h = String(parseInt(partes[0], 10)).padStart(2, '0');
          const m = String(parseInt(partes[1], 10)).padStart(2, '0');
          return `${h}:${m}`;
        }
      }
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
      return hora;
    }
    
    if (hora instanceof Date) {
      if (!isNaN(hora.getTime())) {
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

  const IconoOrigen = ({ className = "h-4 w-4 text-slate-600" }) => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'web': return <Globe className={className} />;
      case 'telefono': return <Phone className={className} />;
      case 'mostrador': return <Store className={className} />;
      default: return <Package className={className} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border border-slate-300 rounded-lg 
        hover:shadow-md transition-all mb-3 flex flex-col
        ${faltaPocoResult ? 'border-red-400 bg-red-50' : ''}
        ${isDragging ? 'select-none' : ''}
        w-full min-h-[100px]
      `}
    >
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-slate-200 pb-2 pt-3 px-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Lado izquierdo: Drag Handle, ID, Origen, Cliente, Badge Retiro/Delivery */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <div className="flex items-center justify-center w-5">
                <div className="flex flex-col gap-0.5">
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
              <IconoOrigen className="h-4 w-4 text-slate-600" />
            </div>
            
            {/* Contenedor para nombre y badge juntos */}
            <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
              <div className="min-w-0 max-w-[200px]">
                <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
              </div>

              {/* Badge Tipo de Entrega - junto al nombre del cliente */}
              {pedido.tipoEntrega === 'delivery' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  DELIVERY
                </Badge>
              )}
              {pedido.tipoEntrega === 'retiro' && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  RETIRO
                </Badge>
              )}
            </div>
          </div>

          {/* Lado derecho: Badge Debe/Pagado y Badge Creado/Para alineados a la derecha */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Badge Estado de pago */}
            {pedido.paymentStatus === 'paid' ? (
              <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap">
                ✓ PAGADO
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap" title={`Debe: $${pedido.total.toLocaleString('es-AR')}`}>
                DEBE ${pedido.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </Badge>
            )}

            {/* Badge Tiempo/Hora - último, con espacio */}
            <div className={`
              text-center px-2 py-1 rounded border flex-shrink-0
              ${faltaPocoResult ? 'bg-red-200 border-2 border-red-500 animate-pulse' : 'bg-slate-200 border border-slate-400'}
            `}>
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
        </div>
      </div>

      {/* Cuerpo Inferior: Items y Acciones - Fondo blanco */}
      <div className="pt-2 px-3 pb-3 flex flex-col flex-grow bg-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Items del pedido */}
          <div className="flex-1 min-w-0">
            <div className="text-slate-900">
              {pedido.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                  <span className="text-xs font-bold">{item.cantidad}x</span> <span className="text-sm truncate">{item.nombre}</span>
                </div>
              ))}
              {pedido.items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{pedido.items.length - 3} más...
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción - siempre visibles, pueden pasar a segunda línea */}
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
            {/* Botón principal según estado */}
            {pedido.estado === 'recibido' && (
              <Button
                onClick={(e) => {
                  const button = e.currentTarget;
                  button.disabled = true;
                  onMarcharACocina(pedido.id);
                  setTimeout(() => {
                    button.disabled = false;
                  }, 2000);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3 disabled:opacity-50 whitespace-nowrap"
                size="sm"
              >
                MARCHAR
              </Button>
            )}
            {pedido.estado === 'en_cocina' && (
              <Button
                onClick={(e) => {
                  const button = e.currentTarget;
                  button.disabled = true;
                  onListo(pedido.id);
                  setTimeout(() => {
                    button.disabled = false;
                  }, 2000);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3 disabled:opacity-50 whitespace-nowrap"
                size="sm"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                LISTO
              </Button>
            )}

            {/* Botón Cobrar */}
            {pedido.paymentStatus === 'pending' && onCobrar && (
              <Button
                onClick={() => onCobrar(pedido)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs h-8 px-3 whitespace-nowrap"
                size="sm"
              >
                <Package className="h-3.5 w-3.5 mr-1" />
                COBRAR
              </Button>
            )}

            {/* Botones secundarios */}
            <Button
              onClick={() => {
                console.log('Imprimir factura/ticket:', pedido.id);
              }}
              variant="outline"
              className="border border-slate-300 hover:bg-slate-100 h-8 w-8 p-0 flex-shrink-0"
              size="sm"
              title="Imprimir"
            >
              <Printer className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => onEditar(pedido)}
              variant="outline"
              className="border border-slate-300 hover:bg-slate-100 h-8 w-8 p-0 flex-shrink-0"
              size="sm"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => onCancelar(pedido)}
              variant="outline"
              className="border border-red-300 hover:bg-red-50 text-red-600 h-8 w-8 p-0 flex-shrink-0"
              size="sm"
              title="Cancelar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente OrderRowGhost - Versión estática para DragOverlay
 * Copia exacta de OrderRow pero sin interactividad y con estilos visuales diferenciados
 */
export function OrderRowGhost({ pedido }) {
  const [currentTime] = useState(Date.now());

  const tiempoTranscurrido = () => {
    const minutos = Math.floor((Date.now() - pedido.timestamp) / 60000);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const formatearHora24 = (hora) => {
    if (!hora) return null;
    
    if (typeof hora === 'string' && /^\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }
    
    if (typeof hora === 'string') {
      if (hora.includes('-') && (hora.includes(' ') || hora.includes('T'))) {
        const fechaStr = hora.includes('T') ? hora : hora.replace(' ', 'T');
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
          const horas = String(fecha.getHours()).padStart(2, '0');
          const minutos = String(fecha.getMinutes()).padStart(2, '0');
          return `${horas}:${minutos}`;
        }
      }
      if (/^\d{1,2}:\d{2}/.test(hora)) {
        const partes = hora.split(':');
        if (partes.length >= 2) {
          const h = String(parseInt(partes[0], 10)).padStart(2, '0');
          const m = String(parseInt(partes[1], 10)).padStart(2, '0');
          return `${h}:${m}`;
        }
      }
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
      return hora;
    }
    
    if (hora instanceof Date) {
      if (!isNaN(hora.getTime())) {
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

  const IconoOrigen = ({ className = "h-4 w-4 text-slate-600" }) => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'web': return <Globe className={className} />;
      case 'telefono': return <Phone className={className} />;
      case 'mostrador': return <Store className={className} />;
      default: return <Package className={className} />;
    }
  };

  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg shadow-lg flex flex-col pointer-events-none select-none w-full min-h-[100px]">
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-slate-200 pb-2 pt-3 px-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Lado izquierdo: Drag Handle, ID, Origen, Cliente, Badge Retiro/Delivery */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-center w-5 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
              <IconoOrigen />
            </div>
            
            {/* Contenedor para nombre y badge juntos */}
            <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
              <div className="min-w-0 max-w-[200px]">
                <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
              </div>

              {/* Badge Tipo de Entrega - junto al nombre del cliente */}
              {pedido.tipoEntrega === 'delivery' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  DELIVERY
                </Badge>
              )}
              {pedido.tipoEntrega === 'retiro' && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  RETIRO
                </Badge>
              )}
            </div>
          </div>

          {/* Lado derecho: Badge Debe/Pagado y Badge Creado/Para alineados a la derecha */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Badge Estado de pago */}
            {pedido.paymentStatus === 'paid' ? (
              <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap">
                ✓ PAGADO
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap" title={`Debe: $${pedido.total.toLocaleString('es-AR')}`}>
                DEBE ${pedido.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </Badge>
            )}

            {/* Badge Tiempo/Hora - último, con espacio */}
            <div className={`
              text-center px-2 py-1 rounded border flex-shrink-0
              ${faltaPocoResult ? 'bg-red-200 border-2 border-red-500 animate-pulse' : 'bg-slate-200 border border-slate-400'}
            `}>
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
        </div>
      </div>

      {/* Cuerpo Inferior: Items y Acciones - Fondo blanco */}
      <div className="pt-2 px-3 pb-3 flex flex-col flex-grow bg-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Items del pedido */}
          <div className="flex-1 min-w-0">
            <div className="text-slate-800">
              {pedido.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                  <span className="text-xs font-bold">{item.cantidad}x</span> <span className="text-sm truncate">{item.nombre}</span>
                </div>
              ))}
              {pedido.items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{pedido.items.length - 3} más...
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción - deshabilitados para ghost */}
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
            {pedido.estado === 'recibido' && (
              <Button
                disabled
                className="bg-blue-600 text-white font-semibold text-xs h-8 px-3 disabled:opacity-50 whitespace-nowrap pointer-events-none"
                size="sm"
              >
                MARCHAR
              </Button>
            )}
            {pedido.estado === 'en_cocina' && (
              <Button
                disabled
                className="bg-blue-600 text-white font-semibold text-xs h-8 px-3 disabled:opacity-50 whitespace-nowrap pointer-events-none"
                size="sm"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                LISTO
              </Button>
            )}
            {pedido.paymentStatus === 'pending' && (
              <Button
                disabled
                className="bg-green-600 text-white font-semibold text-xs h-8 px-3 whitespace-nowrap pointer-events-none"
                size="sm"
              >
                <Package className="h-3.5 w-3.5 mr-1" />
                COBRAR
              </Button>
            )}
            <Button
              disabled
              variant="outline"
              className="border border-slate-300 h-8 w-8 p-0 flex-shrink-0 pointer-events-none"
              size="sm"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              disabled
              variant="outline"
              className="border border-slate-300 h-8 w-8 p-0 flex-shrink-0 pointer-events-none"
              size="sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              disabled
              variant="outline"
              className="border border-red-300 text-red-600 h-8 w-8 p-0 flex-shrink-0 pointer-events-none"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

