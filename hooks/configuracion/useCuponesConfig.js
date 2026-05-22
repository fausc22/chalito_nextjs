import { useCallback, useState } from 'react';
import { cuponesService } from '@/services/cuponesService';

const EMPTY_FORM = {
  codigo: '',
  tipo: 'porcentaje',
  valor: '',
  monto_minimo: '0',
  usos_maximos: '1',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true,
};

export function useCuponesConfig(notification) {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const cargarCupones = useCallback(async () => {
    setLoading(true);
    const result = await cuponesService.listar();
    setLoading(false);
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    setCupones(result.cupones);
  }, [notification]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const abrirEditar = (cupon) => {
    setEditando(cupon);
    setForm({
      codigo: cupon.codigo || '',
      tipo: cupon.tipo || 'porcentaje',
      valor: String(cupon.valor ?? ''),
      monto_minimo: String(cupon.monto_minimo ?? '0'),
      usos_maximos: String(cupon.usos_maximos ?? '1'),
      fecha_inicio: cupon.fecha_inicio
        ? String(cupon.fecha_inicio).slice(0, 16).replace(' ', 'T')
        : '',
      fecha_fin: cupon.fecha_fin
        ? String(cupon.fecha_fin).slice(0, 16).replace(' ', 'T')
        : '',
      activo: Boolean(cupon.activo),
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setForm(EMPTY_FORM);
  };

  const guardarCupon = async () => {
    const codigo = String(form.codigo || '').trim();
    const valor = parseFloat(form.valor);
    if (!codigo) {
      notification?.showError?.('Ingresá un código');
      return false;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      notification?.showError?.('Valor inválido');
      return false;
    }
    if (form.tipo === 'porcentaje' && valor > 100) {
      notification?.showError?.('El porcentaje no puede superar 100');
      return false;
    }

    const payload = {
      codigo,
      tipo: form.tipo,
      valor,
      monto_minimo: parseFloat(form.monto_minimo) || 0,
      usos_maximos: parseInt(form.usos_maximos, 10) || 1,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      activo: form.activo ? 1 : 0,
    };

    setGuardando(true);
    const result = editando
      ? await cuponesService.actualizar(editando.id, payload)
      : await cuponesService.crear(payload);
    setGuardando(false);

    if (!result.success) {
      notification?.showError?.(result.message);
      return false;
    }

    notification?.showSuccess?.(result.message || 'Guardado');
    cerrarModal();
    await cargarCupones();
    return true;
  };

  const toggleActivo = async (cupon) => {
    const result = await cuponesService.toggleActivo(cupon.id);
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    notification?.showSuccess?.(
      result.activo ? 'Cupón activado' : 'Cupón desactivado'
    );
    await cargarCupones();
  };

  return {
    loading,
    guardando,
    cupones,
    modalOpen,
    editando,
    form,
    setForm,
    cargarCupones,
    abrirNuevo,
    abrirEditar,
    cerrarModal,
    guardarCupon,
    toggleActivo,
  };
}
