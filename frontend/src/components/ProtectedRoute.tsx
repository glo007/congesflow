import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/types";

interface Props {
  children: JSX.Element;
  roles?: Role[];
}

/** Garde de route : bloque l'acces selon l'authentification et le role (RBAC cote client). */
export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
