import { useState, useCallback } from 'react';
import { usuariosService } from '../../services/usuariosService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const cargarUsuarios = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    const activoParam =
      filtros.activo === 'all' || filtros.activo === undefined || filtros.activo === ''
        ? undefined
        : filtros.activo;

    const result = await usuariosService.listar({
      page: filtros.page ?? pagination.page,
      limit: filtros.limit ?? pagination.limit,
      q: filtros.q,
      rol: filtros.rol,
      activo: activoParam,
    });
    if (result.success) {
      setUsuarios(result.data);
      if (result.pagination) setPagination((p) => ({ ...p, ...result.pagination }));
    } else {
      setError(result.error);
      setUsuarios([]);
    }
    setLoading(false);
    return result;
  }, [pagination.page, pagination.limit]);

  const crearUsuario = useCallback(async (payload) => {
    setIsMutating(true);
    const result = await usuariosService.crear(payload);
    setIsMutating(false);
    return result;
  }, []);

  const actualizarUsuario = useCallback(async (id, payload) => {
    setIsMutating(true);
    const result = await usuariosService.actualizar(id, payload);
    setIsMutating(false);
    return result;
  }, []);

  const setActivoUsuario = useCallback(async (id, activo) => {
    setIsMutating(true);
    const result = await usuariosService.setActivo(id, activo);
    setIsMutating(false);
    return result;
  }, []);

  const resetPassword = useCallback(async (id, payload) => {
    setIsMutating(true);
    const result = await usuariosService.resetPassword(id, payload);
    setIsMutating(false);
    return result;
  }, []);

  return {
    usuarios,
    loading,
    isMutating,
    error,
    pagination,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    setActivoUsuario,
    resetPassword,
  };
};
