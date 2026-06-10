import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "../api/client";
import { TYPES_ABSENCE, libelleType } from "../api/constants";
import type { Demande, NouvelleDemande, Solde } from "../api/types";
import StatutBadge from "../components/StatutBadge";

export default function MesDemandesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<NouvelleDemande>({
    type_absence_id: 1,
    date_debut: "",
    date_fin: "",
    motif: "",
  });
  const [erreur, setErreur] = useState<string | null>(null);

  const soldes = useQuery({
    queryKey: ["soldes"],
    queryFn: async () => (await api.get<Solde[]>("/api/users/me/solde")).data,
  });

  const demandes = useQuery({
    queryKey: ["mes-demandes"],
    queryFn: async () => (await api.get<Demande[]>("/api/demandes/me")).data,
  });

  const creer = useMutation({
    mutationFn: async (payload: NouvelleDemande) =>
      (await api.post<Demande>("/api/demandes", payload)).data,
    onSuccess: () => {
      setErreur(null);
      setForm({ type_absence_id: 1, date_debut: "", date_fin: "", motif: "" });
      qc.invalidateQueries({ queryKey: ["mes-demandes"] });
      qc.invalidateQueries({ queryKey: ["soldes"] });
    },
    onError: (e: AxiosError<{ detail: string }>) =>
      setErreur(e.response?.data?.detail ?? "Erreur lors de la création."),
  });

  const annuler = useMutation({
    mutationFn: async (id: number) => api.patch(`/api/demandes/${id}/annuler`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mes-demandes"] });
      qc.invalidateQueries({ queryKey: ["soldes"] });
    },
  });

  return (
    <div className="space-y-8">
      {/* Soldes */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Mes soldes</h2>
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          {soldes.data?.map((s) => (
            <div key={s.type_absence_id} className="rounded-lg border bg-white p-4">
              <p className="text-sm text-slate-500">{libelleType(s.type_absence_id)}</p>
              <p className="text-2xl font-bold text-brand-700">{s.jours_restants}</p>
              <p className="text-xs text-slate-400">
                {s.jours_pris} pris / {s.jours_acquis} acquis
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulaire */}
      <section className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Nouvelle demande</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            creer.mutate(form);
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Type d'absence</label>
            <select
              value={form.type_absence_id}
              onChange={(e) => setForm({ ...form, type_absence_id: Number(e.target.value) })}
              className="w-full rounded-md border px-3 py-2"
            >
              {Object.entries(TYPES_ABSENCE).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block" />
          <div>
            <label className="mb-1 block text-sm font-medium">Date de début</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date de fin</label>
            <input
              type="date"
              value={form.date_fin}
              onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Motif (optionnel)</label>
            <input
              type="text"
              value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          {erreur && <p className="text-sm text-rose-600 sm:col-span-2">{erreur}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creer.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {creer.isPending ? "Envoi…" : "Envoyer la demande"}
            </button>
          </div>
        </form>
      </section>

      {/* Liste */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Historique</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Période</th>
                <th className="px-4 py-2">Jours</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {demandes.data?.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{libelleType(d.type_absence_id)}</td>
                  <td className="px-4 py-2">
                    {d.date_debut} → {d.date_fin}
                  </td>
                  <td className="px-4 py-2">{d.nb_jours_ouvres}</td>
                  <td className="px-4 py-2">
                    <StatutBadge statut={d.statut} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    {(d.statut === "SOUMISE" || d.statut === "VALIDEE") && (
                      <button
                        onClick={() => annuler.mutate(d.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {demandes.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Aucune demande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
