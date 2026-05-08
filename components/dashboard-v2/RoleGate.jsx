import { ROLES } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export function RoleGate({ children, adminOnly = false, minimumRole = null, fallback = null }) {
  const { userRole, hasMinimumRole } = useAuth();

  if (adminOnly) {
    return userRole === ROLES.ADMIN ? children : fallback;
  }

  if (minimumRole) {
    return hasMinimumRole(minimumRole) ? children : fallback;
  }

  return children;
}
