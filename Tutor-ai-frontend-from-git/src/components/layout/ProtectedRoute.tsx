import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  guestOnly?: boolean;
}

export function ProtectedRoute({ children, guestOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Or a spinner component
    return <div>Loading...</div>;
  }

  if (guestOnly) {
    // For routes like /login, /register
    // If user is logged in, redirect them away from these pages
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // For protected routes
    // If user is not logged in, redirect them to the login page
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}
