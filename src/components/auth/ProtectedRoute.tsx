import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="text-xs font-semibold text-slate-500 tracking-wide">
          Loading robotics workstation...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role-restricted
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(role) || (allowedRoles.includes('admin') && isAdmin);
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
