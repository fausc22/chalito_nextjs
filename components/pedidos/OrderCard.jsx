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
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const tiempoTranscurrido = () => {
    const minutos = Math.floor((Date.now() - pedido.timestamp) / 60000);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
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
      className="mb-2 shadow-sm hover:shadow-md transition-all border border-slate-300"
    >
      <CardHeader className="pb-2 pt-3 px-3 bg-slate-200">
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
                  {pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-3 pb-3">
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

