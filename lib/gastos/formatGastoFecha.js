const parseGastoFecha = (value) => {
    if (!value) return null;

    if (typeof value === 'string') {
        const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateOnly) {
            const [, y, m, d] = dateOnly;
            return new Date(Number(y), Number(m) - 1, Number(d));
        }
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

/** Fecha del gasto: solo día, sin hora (DD/MM/YYYY en es-AR). */
export function formatFechaGasto(value, { long = false } = {}) {
    const date = parseGastoFecha(value);
    if (!date) return '';

    if (long) {
        return date.toLocaleDateString('es-AR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/** Auditoría de edición: fecha y hora. */
export function formatFechaModificacion(value) {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
