import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Stats } from "../api/types";
import { IconCheck, IconClock, IconInbox, IconUsers, IconWallet, IconX } from "../components/icons";

function StatCard({ icon, label, value, accent }: { icon: JSX.Element; label: string; value: string | number; accent: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="truncate text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await api.get<Stats>("/api/stats")).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tableau de bord</h1>
        <p className="text-sm text-slate-500">Vue d'ensemble des demandes et des congés.</p>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={<IconClock className="h-6 w-6 text-amber-600" />} label="Demandes en attente" value={data.en_attente} accent="bg-amber-100" />
            <StatCard icon={<IconCheck className="h-6 w-6 text-emerald-600" />} label="Demandes validées" value={data.validees} accent="bg-emerald-100" />
            <StatCard icon={<IconX className="h-6 w-6 text-rose-600" />} label="Demandes refusées" value={data.refusees} accent="bg-rose-100" />
            <StatCard icon={<IconWallet className="h-6 w-6 text-brand-600" />} label="Jours validés ce mois" value={data.jours_valides_mois} accent="bg-brand-100" />
            <StatCard icon={<IconUsers className="h-6 w-6 text-sky-600" />} label="Effectif suivi" value={data.effectif} accent="bg-sky-100" />
            <StatCard icon={<IconInbox className="h-6 w-6 text-slate-600" />} label="Total des demandes" value={data.total} accent="bg-slate-100" />
          </div>

          {/* Répartition par statut */}
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Répartition des demandes</h2>
            <div className="space-y-3">
              {[
                { label: "En attente", value: data.en_attente, color: "bg-amber-500" },
                { label: "Validées", value: data.validees, color: "bg-emerald-500" },
                { label: "Refusées", value: data.refusees, color: "bg-rose-500" },
                { label: "Annulées", value: data.annulees, color: "bg-slate-400" },
              ].map((row) => {
                const pct = data.total ? Math.round((row.value / data.total) * 100) : 0;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-slate-600">{row.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-ink">{row.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
