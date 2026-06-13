import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { libelleType } from "../api/constants";
import type { Demande } from "../api/types";
import StatutBadge from "../components/StatutBadge";
import { useToast } from "../components/Toast";
import { IconCheck, IconInbox, IconX } from "../components/icons";

export default function ValidationPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const demandes = useQuery({
    queryKey: ["demandes-a-valider"],
    queryFn: async () => (await api.get<Demande[]>("/api/demandes", { params: { statut: "SOUMISE" } })).data,
  });

  const decider = useMutation({
    mutationFn: async ({ id, action, commentaire }: { id: number; action: "valider" | "refuser"; commentaire?: string }) =>
      api.patch(`/api/demandes/${id}/${action}`, action === "refuser" ? { commentaire } : undefined),
    onSuccess: (_d, v) => {
      toast(v.action === "valider" ? "success" : "info", v.action === "valider" ? "Demande validée." : "Demande refusée.");
      qc.invalidateQueries({ queryKey: ["demandes-a-valider"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast("error", "Action impossible."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Demandes à valider</h1>
        <p className="text-sm text-slate-500">Les demandes en attente de votre équipe.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Salarié</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Période</th>
              <th className="px-4 py-3 font-semibold">Jours</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demandes.data?.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-ink">#{d.employe_id}</td>
                <td className="px-4 py-3 text-slate-600">{libelleType(d.type_absence_id)}</td>
                <td className="px-4 py-3 text-slate-600">{d.date_debut} → {d.date_fin}</td>
                <td className="px-4 py-3 text-slate-600">{d.nb_jours_ouvres}</td>
                <td className="px-4 py-3"><StatutBadge statut={d.statut} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => decider.mutate({ id: d.id, action: "valider" })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700">
                      <IconCheck className="h-3.5 w-3.5" /> Valider
                    </button>
                    <button onClick={() => { const c = window.prompt("Motif du refus :") ?? ""; decider.mutate({ id: d.id, action: "refuser", commentaire: c }); }} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700">
                      <IconX className="h-3.5 w-3.5" /> Refuser
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {demandes.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  <IconInbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  Aucune demande en attente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
