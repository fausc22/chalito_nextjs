import { NavBar } from './NavBar';
import { Footer } from './Footer';
import Head from 'next/head';
import { ROUTE_TITLES } from '../../config/routes';
import { useRouter } from 'next/router';

export function Layout({ children, title, description }) {
  const router = useRouter();
  const pageTitle = title || ROUTE_TITLES[router.pathname] || 'El Chalito';
  const fullTitle = `${pageTitle} - El Chalito`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <div className="page-layout">
        <NavBar />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
