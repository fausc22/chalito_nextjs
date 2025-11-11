import { StatsCard, StatsGrid } from '../common/StatsCard';

/**
 * Componente de estadísticas para la página de artículos
 */
export const ArticulosStats = ({ estadisticas }) => {
  return (
    <StatsGrid columns={4} className="mb-8">
      <StatsCard
        title="Total Artículos"
        value={estadisticas.total || 0}
        icon="📦"
        color="blue"
      />
      <StatsCard
        title="Disponibles"
        value={estadisticas.disponibles || 0}
        icon="✅"
        color="green"
        subtitle="En stock"
      />
      <StatsCard
        title="No Disponibles"
        value={estadisticas.noDisponibles || 0}
        icon="❌"
        color="red"
        subtitle="Sin stock"
      />
      <StatsCard
        title="Categorías"
        value={estadisticas.totalCategorias || 0}
        icon="🏷️"
        color="purple"
        subtitle="Diferentes"
      />
    </StatsGrid>
  );
};


