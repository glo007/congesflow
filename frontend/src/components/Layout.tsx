import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const lien = (to: string, label: string) => (
    <Link
      to={to}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        pathname === to ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );

  const estManager = user?.role === "MANAGER" || user?.role === "RH";

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-brand-700">CongésFlow</span>
            <nav className="flex gap-1">
              {lien("/", "Mes demandes")}
              {estManager && lien("/validation", "À valider")}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">
              {user?.prenom} {user?.nom} · <strong>{user?.role}</strong>
            </span>
            <button
              onClick={logout}
              className="rounded-md border px-3 py-1.5 text-slate-600 hover:bg-slate-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
