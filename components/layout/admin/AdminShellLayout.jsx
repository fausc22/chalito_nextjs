import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ROUTE_TITLES } from '@/config/routes';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminShellLayout({ children, title, description }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const pageTitle = useMemo(() => title || ROUTE_TITLES[router.pathname] || 'El Chalito', [title, router.pathname]);
  const fullTitle = `${pageTitle} - El Chalito`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>

      <div className="min-h-screen bg-[#F5F7FB] text-slate-900">
        <div className="flex min-h-screen overflow-hidden">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar
              title={pageTitle}
              sidebarCollapsed={sidebarCollapsed}
              onSidebarToggle={() => setSidebarCollapsed((prev) => !prev)}
              onMobileMenuOpen={() => setMobileSidebarOpen(true)}
            />
            <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
