import Head from 'next/head';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ModoCocina } from '../../components/pedidos/ModoCocina';

export default function CocinaPage() {
  return (
    <>
      <Head>
        <title>Cocina - El Chalito</title>
      </Head>
      <ErrorBoundary>
      <ModoCocina
        isOpen={true}
        onClose={() => {}}
        modoCocina={true}
      />
    </ErrorBoundary>
    </>
  );
}




















