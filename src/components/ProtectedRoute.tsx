import { Navigate, Outlet } from "react-router-dom";
import { NormalizedRole, useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";
import { getUserRole } from "../utils/permissions";

interface ProtectedRouteProps {
  allowedRoles?: NormalizedRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader fullScreen={true} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getUserRole(user);
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}