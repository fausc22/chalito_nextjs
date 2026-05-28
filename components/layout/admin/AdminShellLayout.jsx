import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ROUTE_TITLES, ROUTES } from '@/config/routes';

function isPedidosRoute(pathname) {
  return pathname === ROUTES.PEDIDOS || pathname?.startsWith(`${ROUTES.PEDIDOS}/`);
}
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminShellLayout({
  children,
  title,
  description,
  contentVariant = 'default',
  topbarActions = null,
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => isPedidosRoute(router.pathname));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [topbarHeight, setTopbarHeight] = useState(65);
  const topbarRef = useRef(null);

  const pageTitle = useMemo(() => title || ROUTE_TITLES[router.pathname] || 'El Chalito', [title, router.pathname]);
  const fullTitle = `${pageTitle} - El Chalito`;

  useEffect(() => {
    if (isPedidosRoute(router.pathname)) {
      setSidebarCollapsed(true);
    }
  }, [router.pathname]);

  useLayoutEffect(() => {
    const element = topbarRef.current;
    if (!element) return undefined;

    const measure = () => {
      const height = element.getBoundingClientRect().height;
      if (Number.isFinite(height) && height > 0) {
        setTopbarHeight(height);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [topbarActions]);

  const mainClassName =
    contentVariant === 'fullBleed'
      ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-0'
      : 'flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-6';

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>

      <div
        className="min-h-screen bg-background text-foreground"
        style={{ '--admin-topbar-height': `${topbarHeight}px` }}
      >
        <div className="flex min-h-screen overflow-hidden">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AdminTopbar
              ref={topbarRef}
              title={pageTitle}
              onMobileMenuOpen={() => setMobileSidebarOpen(true)}
              actions={topbarActions}
            />
            <main className={mainClassName}>{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
