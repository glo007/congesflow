import type { StatutDemande } from "../api/types";

const STYLES: Record<StatutDemande, string> = {
  SOUMISE: "bg-amber-100 text-amber-800",
  VALIDEE: "bg-emerald-100 text-emerald-800",
  REFUSEE: "bg-rose-100 text-rose-800",
  ANNULEE: "bg-slate-200 text-slate-600",
};

export default function StatutBadge({ statut }: { statut: StatutDemande }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[statut]}`}>
      {statut}
    </span>
  );
}
