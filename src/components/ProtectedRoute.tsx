import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras leemos si hay token en localStorage, mostramos un spinner estético
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400" />
      </div>
    );
  }

  // Si no está autenticado, lo redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos la ruta hija (el Dashboard)
  return <Outlet />;
}