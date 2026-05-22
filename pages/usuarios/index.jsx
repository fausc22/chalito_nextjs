import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { UsuariosTab } from '@/components/usuarios/UsuariosTab';
import { useUsuarios } from '@/hooks/usuarios/useUsuarios';

function UsuariosContent() {
  const {
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
  } = useUsuarios();

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return (
    <Layout title="Usuarios">
      <UsuariosTab
        usuarios={usuarios}
        loading={loading}
        isMutating={isMutating}
        error={error}
        pagination={pagination}
        cargarUsuarios={cargarUsuarios}
        crearUsuario={crearUsuario}
        actualizarUsuario={actualizarUsuario}
        setActivoUsuario={setActivoUsuario}
        resetPassword={resetPassword}
      />
    </Layout>
  );
}

export default function UsuariosPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute module="usuarios">
        <UsuariosContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
