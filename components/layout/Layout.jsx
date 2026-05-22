import { AdminShellLayout } from './admin/AdminShellLayout';

export function Layout({
  children,
  title,
  description,
  contentVariant = 'default',
  topbarActions = null,
}) {
  return (
    <AdminShellLayout
      title={title}
      description={description}
      contentVariant={contentVariant}
      topbarActions={topbarActions}
    >
      {children}
    </AdminShellLayout>
  );
}
