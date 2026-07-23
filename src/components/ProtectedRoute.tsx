import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Reutilizamos tu PageLoader premium para mantener coherencia estética
  if (isLoading) {
    return <PageLoader fullScreen={true} />;
  }

  // 2. Si no está autenticado, redirigimos al login de forma segura
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si está autenticado, renderizamos las rutas protegidas (ej. el Dashboard)
  return <Outlet />;
}