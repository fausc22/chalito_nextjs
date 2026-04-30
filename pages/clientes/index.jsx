import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { clientesService } from '@/services/clientesService';
import ClientesTable from '@/components/clientes/ClientesTable';
import ClienteDetalleDrawer from '@/components/clientes/ClienteDetalleDrawer';

function ClientesContent() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedClienteId, setSelectedClienteId] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const result = await clientesService.listar({ page, limit: 20, q: query });
    if (result.success) {
      setClientes(result.data || []);
      setPagination(result.pagination);
    } else {
      setClientes([]);
      setPagination(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, [page]);

  return (
    <Layout title="Clientes">
      <main className="main-content space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#315e92]">Clientes</h1>
        </div>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono"
          />
          <Button onClick={() => { setPage(1); cargar(); }}>
            Buscar
          </Button>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Cargando clientes...</p> : null}
        <ClientesTable
          clientes={clientes}
          onSelectCliente={(cliente) => setSelectedClienteId(cliente.id)}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagination?.page || page}
          </span>
          <Button
            variant="outline"
            disabled={!pagination || (pagination.page * pagination.limit >= pagination.total)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>

        <ClienteDetalleDrawer
          isOpen={Boolean(selectedClienteId)}
          onClose={() => setSelectedClienteId(null)}
          clienteId={selectedClienteId}
          onClienteUpdated={cargar}
        />
      </main>
    </Layout>
  );
}

export default function ClientesPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="GERENTE">
        <ClientesContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
