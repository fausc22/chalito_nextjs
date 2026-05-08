import { AdminShellLayout } from './admin/AdminShellLayout';

export function Layout({ children, title, description }) {
  return (
    <AdminShellLayout title={title} description={description}>
      {children}
    </AdminShellLayout>
  );
}
