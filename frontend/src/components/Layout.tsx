import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { IconCalendar, IconDashboard, IconInbox, IconLogout } from "./icons";

const ROLE_LABEL: Record<string, string> = { SALARIE: "Salarié", MANAGER: "Manager", RH: "Ressources Humaines" };

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const estManager = user?.role === "MANAGER" || user?.role === "RH";

  const NavItem = ({ to, icon, label }: { to: string; icon: JSX.Element; label: string }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          active ? "bg-brand-600 text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  const initiales = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy px-4 py-6 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">C</div>
          <span className="text-lg font-bold text-white">CongésFlow</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
          <NavItem to="/" icon={<IconCalendar className="h-5 w-5" />} label="Mes demandes" />
          {estManager && <NavItem to="/validation" icon={<IconInbox className="h-5 w-5" />} label="À valider" />}
          {estManager && <NavItem to="/dashboard" icon={<IconDashboard className="h-5 w-5" />} label="Tableau de bord" />}
        </nav>
        <div className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-slate-400">
          Connecté en tant que<br />
          <span className="font-semibold text-slate-200">{ROLE_LABEL[user?.role ?? ""]}</span>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2 sm:hidden">
            <span className="text-lg font-bold text-brand-700">CongésFlow</span>
          </div>
          <div className="hidden text-sm text-slate-400 sm:block">Gestion des demandes de congés</div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initiales}</div>
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold text-ink">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button onClick={logout} title="Déconnexion" className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-rose-600">
              <IconLogout className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Nav mobile */}
        <nav className="flex gap-1 border-b border-slate-200 bg-white px-4 py-2 sm:hidden">
          <Link to="/" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600">Mes demandes</Link>
          {estManager && <Link to="/validation" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600">À valider</Link>}
          {estManager && <Link to="/dashboard" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600">Tableau</Link>}
        </nav>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
