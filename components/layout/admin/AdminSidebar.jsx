import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMainNavItems } from './navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function AdminSidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const router = useRouter();
  const { userRole } = useAuth();
  const [collapsedLogoError, setCollapsedLogoError] = useState(false);
  const navItems = getMainNavItems(userRole);

  const isActiveRoute = (route) =>
    router.pathname === route || router.pathname.startsWith(`${route}/`);

  return (
    <>
      <div className={`hidden shrink-0 transition-all duration-300 ease-in-out lg:block ${collapsed ? 'w-20' : 'w-64'}`}>
        <aside className="flex h-full w-full overflow-x-hidden border-r border-blue-900/50 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-900 text-white">
          <div className="flex h-full w-full min-w-0 flex-col overflow-x-hidden">
            <div
              className={`relative border-b border-blue-800/70 transition-all duration-300 ${
                collapsed ? 'px-2 py-4' : 'px-4 py-5'
              }`}
            >
              {!collapsed ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={onToggleCollapse}
                  aria-label="Colapsar sidebar"
                  className="absolute right-2 top-3 h-8 w-8 text-blue-100 hover:bg-blue-800/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : null}
              <div className={`flex min-w-0 ${collapsed ? 'flex-col items-center gap-2' : 'justify-start'}`}>
                <Link
                  href="/"
                  className={`relative block overflow-hidden transition-all duration-300 ${
                    collapsed ? 'h-11 w-11 rounded-xl' : 'h-16 w-44 rounded-none'
                  }`}
                  aria-label="Inicio"
                >
                  <Image
                    src="/logo-empresa.png"
                    alt="El Chalito"
                    fill
                    sizes="176px"
                    className={`object-contain transition-all duration-300 ${
                      collapsed ? 'pointer-events-none w-0 scale-95 opacity-0' : 'w-full scale-100 opacity-100'
                    }`}
                    priority
                  />
                  {!collapsedLogoError ? (
                    <Image
                      src="/cactus-chalito-logo.png"
                      alt="Isotipo El Chalito"
                      fill
                      sizes="44px"
                      className={`object-contain p-1 transition-all duration-300 ${
                        collapsed ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
                      }`}
                      onError={() => setCollapsedLogoError(true)}
                      priority
                    />
                  ) : (
                    <span
                      className={`absolute inset-0 flex items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white transition-all duration-300 ${
                        collapsed ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
                      }`}
                    >
                      EC
                    </span>
                  )}
                </Link>
                {collapsed ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={onToggleCollapse}
                    aria-label="Expandir sidebar"
                    className="h-8 w-8 text-blue-100 hover:bg-blue-800/60"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            <nav
              className={`flex-1 space-y-2 overflow-x-hidden overflow-y-auto transition-all duration-300 ${
                collapsed ? 'px-2 py-5' : 'px-3 py-5'
              }`}
            >
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActiveRoute(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex h-11 items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-white text-blue-900 shadow-[0_2px_10px_rgba(15,23,42,0.2)]'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    } ${collapsed ? 'w-11 justify-center px-0 mx-auto' : 'px-3'}`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                        active ? 'text-blue-900' : 'text-blue-200 group-hover:translate-x-[1px] group-hover:text-white'
                      }`}
                    />
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                        collapsed ? 'ml-0 w-0 max-w-0 opacity-0' : 'ml-3 w-auto max-w-[180px] opacity-100'
                      }`}
                      aria-hidden={collapsed}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div
              className={`border-t border-blue-800/70 transition-all duration-300 ${
                collapsed ? 'px-2 py-4 overflow-x-hidden' : 'px-4 py-4'
              }`}
            >
              <div
                className={`flex h-9 items-center rounded-lg text-xs text-blue-200 transition-all duration-300 ${
                  collapsed ? 'justify-center' : 'justify-start px-2'
                }`}
              >
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    collapsed ? 'w-0 max-w-0 opacity-0' : 'w-auto max-w-[160px] opacity-100'
                  }`}
                  aria-hidden={collapsed}
                >
                  Sistema v2
                </span>
                {collapsed ? <span className="h-2 w-2 rounded-full bg-blue-200/80" /> : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/35 transition-opacity lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-blue-900/50 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-900 text-white shadow-xl transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-24 items-center justify-between border-b border-blue-800/70 px-4">
          <div className="relative h-16 w-44">
            <Image
              src="/logo-empresa.png"
              alt="El Chalito"
              fill
              sizes="176px"
              className="object-contain"
              priority
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onMobileClose}
            aria-label="Cerrar sidebar"
            className="h-8 w-8 text-blue-100 hover:bg-blue-800/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActiveRoute(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-white text-blue-900 shadow-[0_2px_10px_rgba(15,23,42,0.2)]'
                    : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    active ? 'text-blue-900' : 'text-blue-200 group-hover:translate-x-[1px] group-hover:text-white'
                  }`}
                />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
