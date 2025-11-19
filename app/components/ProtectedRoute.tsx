import { Navigate } from 'react-router';
import { auth } from '~/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}