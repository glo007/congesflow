import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { libelleType } from "../api/constants";
import type { Demande } from "../api/types";
import StatutBadge from "../components/StatutBadge";

export default function ValidationPage() {
  const qc = useQueryClient();

  const demandes = useQuery({
    queryKey: ["demandes-a-valider"],
    queryFn: async () =>
      (await api.get<Demande[]>("/api/demandes", { params: { statut: "SOUMISE" } })).data,
  });

  const decider = useMutation({
    mutationFn: async ({ id, action, commentaire }: { id: number; action: "valider" | "refuser"; commentaire?: string }) =>
      api.patch(`/api/demandes/${id}/${action}`, action === "refuser" ? { commentaire } : undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["demandes-a-valider"] }),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Demandes à valider</h2>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Salarié</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Période</th>
              <th className="px-4 py-2">Jours</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {demandes.data?.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-2">#{d.employe_id}</td>
                <td className="px-4 py-2">{libelleType(d.type_absence_id)}</td>
                <td className="px-4 py-2">
                  {d.date_debut} → {d.date_fin}
                </td>
                <td className="px-4 py-2">{d.nb_jours_ouvres}</td>
                <td className="px-4 py-2">
                  <StatutBadge statut={d.statut} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => decider.mutate({ id: d.id, action: "valider" })}
                      className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        const c = window.prompt("Motif du refus :") ?? "";
                        decider.mutate({ id: d.id, action: "refuser", commentaire: c });
                      }}
                      className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Refuser
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {demandes.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Aucune demande en attente. 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
