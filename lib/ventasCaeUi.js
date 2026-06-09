export const CAE_ESTADOS_FACTURABLES = ['NO_APLICA', 'ERROR', 'ERROR_PERMANENTE'];

export const puedeSolicitarFacturaArca = (venta) => {
    if (!venta || venta.estado !== 'FACTURADA') return false;
    if (venta.cae_id) return false;
    const estado = String(venta.cae_estado || '').trim().toUpperCase();
    return CAE_ESTADOS_FACTURABLES.includes(estado);
};

export const getCaeEstadoBadgeProps = (caeEstado) => {
    const estado = String(caeEstado || 'NO_APLICA').trim().toUpperCase();
    switch (estado) {
        case 'OK':
            return { label: 'CAE OK', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' };
        case 'PENDIENTE':
            return { label: 'CAE pendiente', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' };
        case 'ERROR':
        case 'ERROR_PERMANENTE':
            return { label: estado === 'ERROR_PERMANENTE' ? 'CAE error permanente' : 'CAE error', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
        case 'NO_APLICA':
            return { label: 'Sin factura ARCA', className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' };
        default:
            return { label: estado, className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' };
    }
};
