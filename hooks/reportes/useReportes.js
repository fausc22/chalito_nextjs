import { useCallback, useState } from 'react';
import { reportesService } from '../../services/reportesService';

const EMPTY_DASHBOARD = {
  resumen: {},
  ventasPorDia: [],
  productosMasVendidos: [],
  horariosDemanda: [],
  mediosPago: [],
  origenes: [],
  modalidades: [],
};

export const useReportes = () => {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const cargarDashboard = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportesService.obtenerDashboard(filtros);

      if (!response.success) {
        setError(response.error || 'No se pudieron cargar los reportes.');
        setDashboard(EMPTY_DASHBOARD);
        return { success: false, error: response.error };
      }

      setDashboard({
        resumen: response.data?.resumen || {},
        ventasPorDia: response.data?.ventasPorDia || [],
        productosMasVendidos: response.data?.productosMasVendidos || [],
        horariosDemanda: response.data?.horariosDemanda || [],
        mediosPago: response.data?.mediosPago || [],
        origenes: response.data?.origenes || [],
        modalidades: response.data?.modalidades || [],
      });
      setFiltrosAplicados(response.filtros || {});
      return { success: true };
    } catch (errorCarga) {
      console.error('❌ Error inesperado al cargar reportes:', errorCarga);
      setError('No se pudieron cargar los reportes.');
      setDashboard(EMPTY_DASHBOARD);
      return { success: false, error: 'No se pudieron cargar los reportes.' };
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  return {
    dashboard,
    filtrosAplicados,
    loading,
    error,
    hasLoaded,
    cargarDashboard,
  };
};

