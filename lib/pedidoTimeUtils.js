/**
 * Utilidades para el cálculo y formateo de tiempo de pedidos
 * Unifica la lógica de visualización de tiempo entre Cards y Tabla
 */

/**
 * Formatea una hora a formato 24 horas (HH:MM)
 * @param {string|Date} hora - Hora en cualquier formato
 * @returns {string|null} - Hora en formato HH:MM o null si no es válida
 */
export const formatearHora24 = (hora) => {
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

/**
 * Formatea minutos a formato legible (Xm o Xh Xm)
 * @param {number} minutos - Cantidad de minutos
 * @returns {string} - String formateado
 */
export const formatearMinutos = (minutos) => {
  if (minutos < 60) return `${minutos}m`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
};

/**
 * Calcula el estado temporal completo de un pedido
 * @param {Object} pedido - Objeto del pedido
 * @param {number} currentTime - Timestamp actual (opcional, usa Date.now() si no se proporciona)
 * @returns {Object} - Objeto con { label, isLate, minutes, isNearLimit, isNearScheduled }
 */
export const calcularEstadoTemporalPedido = (pedido, currentTime = null) => {
  const ahora = currentTime || Date.now();
  
  // Si el pedido está en cocina
  if (pedido.estado === 'en_cocina') {
    // Verificar si tiene hora de inicio de preparación y tiempo estimado
    if (pedido.horaInicioPreparacion && pedido.tiempoEstimadoPreparacion) {
      const horaInicio = new Date(pedido.horaInicioPreparacion).getTime();
      const tiempoEstimadoMs = pedido.tiempoEstimadoPreparacion * 60 * 1000; // minutos a ms
      const horaEsperadaFinalizacion = horaInicio + tiempoEstimadoMs;
      const minutosTranscurridos = Math.floor((ahora - horaInicio) / 60000);
      
      // Verificar si está atrasado
      const estaAtrasado = ahora > horaEsperadaFinalizacion;
      
      // Calcular minutos de atraso si está atrasado
      const minutosAtraso = estaAtrasado ? Math.floor((ahora - horaEsperadaFinalizacion) / 60000) : 0;
      
      // Verificar si está cerca del límite (80% del tiempo estimado)
      const hora80PorCiento = horaInicio + (tiempoEstimadoMs * 0.8);
      const cercaDelLimite = ahora >= hora80PorCiento && ahora < horaEsperadaFinalizacion;
      
      return {
        label: estaAtrasado ? `Atrasado ${minutosAtraso}m` : `En prep. ${minutosTranscurridos}m`,
        isLate: estaAtrasado,
        minutes: estaAtrasado ? minutosAtraso : minutosTranscurridos,
        isNearLimit: cercaDelLimite,
        isNearScheduled: false,
        subLabel: estaAtrasado ? 'Atrasado' : 'En prep.'
      };
    }
    
    // Si está en cocina pero no tiene datos de preparación, mostrar tiempo transcurrido desde creación
    if (pedido.timestamp) {
      const minutosTranscurridos = Math.floor((ahora - pedido.timestamp) / 60000);
      return {
        label: `En prep. ${minutosTranscurridos}m`,
        isLate: false,
        minutes: minutosTranscurridos,
        isNearLimit: false,
        isNearScheduled: false,
        subLabel: 'En prep.'
      };
    }
  }
  
  // Si es pedido "cuanto antes" (tipo 'ya')
  if (pedido.tipo === 'ya' || !pedido.horaProgramada) {
    if (pedido.timestamp) {
      const minutosTranscurridos = Math.floor((ahora - pedido.timestamp) / 60000);
      return {
        label: `Creado ${formatearMinutos(minutosTranscurridos)}`,
        isLate: false,
        minutes: minutosTranscurridos,
        isNearLimit: false,
        isNearScheduled: false,
        subLabel: 'Creado'
      };
    }
  }
  
  // Si es pedido programado
  if (pedido.tipo === 'programado' || pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega) {
    const horaProgramada = pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega;
    
    if (!horaProgramada) {
      // Fallback a "Creado" si no hay hora programada
      if (pedido.timestamp) {
        const minutosTranscurridos = Math.floor((ahora - pedido.timestamp) / 60000);
        return {
          label: `Creado ${formatearMinutos(minutosTranscurridos)}`,
          isLate: false,
          minutes: minutosTranscurridos,
          isNearLimit: false,
          isNearScheduled: false,
          subLabel: 'Creado'
        };
      }
      return {
        label: 'N/A',
        isLate: false,
        minutes: 0,
        isNearLimit: false,
        isNearScheduled: false,
        subLabel: 'N/A'
      };
    }
    
    try {
      let horaObjetivo;
      
      // Verificar si viene en formato ISO completo
      if (typeof horaProgramada === 'string' && horaProgramada.includes('-') && 
          (horaProgramada.includes(' ') || horaProgramada.includes('T'))) {
        const fechaStr = horaProgramada.includes('T') ? horaProgramada : horaProgramada.replace(' ', 'T');
        horaObjetivo = new Date(fechaStr);
      } else {
        // Formato HH:MM o HH:MM a. m./p. m.
        const hora24 = formatearHora24(horaProgramada);
        if (!hora24) {
          return {
            label: 'N/A',
            isLate: false,
            minutes: 0,
            isNearLimit: false,
            isNearScheduled: false,
            subLabel: 'N/A'
          };
        }
        
        const [horas, minutos] = hora24.split(':').map(Number);
        horaObjetivo = new Date();
        horaObjetivo.setHours(horas, minutos, 0, 0);
        
        // Si la hora programada ya pasó hoy, asumir que es para mañana
        if (horaObjetivo < new Date()) {
          horaObjetivo.setDate(horaObjetivo.getDate() + 1);
        }
      }
      
      // Validar que la fecha sea válida
      if (isNaN(horaObjetivo.getTime())) {
        return {
          label: 'N/A',
          isLate: false,
          minutes: 0,
          isNearLimit: false,
          isNearScheduled: false,
          subLabel: 'N/A'
        };
      }
      
      const diferenciaMinutos = (horaObjetivo.getTime() - ahora) / 60000;
      
      // Verificar si está cerca de la hora programada (10-15 minutos antes)
      const cercaProgramado = diferenciaMinutos <= 15 && diferenciaMinutos >= 10;
      
      // Si ya pasó la hora programada, considerar atrasado
      const estaAtrasado = diferenciaMinutos < 0;
      const minutosAtraso = estaAtrasado ? Math.abs(Math.floor(diferenciaMinutos)) : 0;
      
      // Si está atrasado, mostrar "Atrasado Xm"
      if (estaAtrasado) {
        return {
          label: `Atrasado ${minutosAtraso}m`,
          isLate: true,
          minutes: minutosAtraso,
          isNearLimit: false,
          isNearScheduled: cercaProgramado,
          subLabel: 'Atrasado',
          horaProgramada: formatearHora24(horaProgramada)
        };
      }
      
      // Mostrar hora programada
      return {
        label: formatearHora24(horaProgramada) || 'N/A',
        isLate: false,
        minutes: Math.floor(diferenciaMinutos),
        isNearLimit: false,
        isNearScheduled: cercaProgramado,
        subLabel: 'Para',
        horaProgramada: formatearHora24(horaProgramada)
      };
    } catch (error) {
      console.error(`Error calculando estado temporal del pedido #${pedido.id}:`, error);
      return {
        label: 'N/A',
        isLate: false,
        minutes: 0,
        isNearLimit: false,
        isNearScheduled: false,
        subLabel: 'N/A'
      };
    }
  }
  
  // Fallback por defecto
  return {
    label: 'N/A',
    isLate: false,
    minutes: 0,
    isNearLimit: false,
    isNearScheduled: false,
    subLabel: 'N/A'
  };
};






