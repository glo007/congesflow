import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "../api/client";
import { TYPES_ABSENCE, libelleType } from "../api/constants";
import type { Demande, NouvelleDemande, Solde } from "../api/types";
import StatutBadge from "../components/StatutBadge";
import { useToast } from "../components/Toast";
import { IconPlus, IconWallet } from "../components/icons";

export default function MesDemandesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<NouvelleDemande>({ type_absence_id: 1, date_debut: "", date_fin: "", motif: "" });

  const soldes = useQuery({ queryKey: ["soldes"], queryFn: async () => (await api.get<Solde[]>("/api/users/me/solde")).data });
  const demandes = useQuery({ queryKey: ["mes-demandes"], queryFn: async () => (await api.get<Demande[]>("/api/demandes/me")).data });

  const creer = useMutation({
    mutationFn: async (payload: NouvelleDemande) => (await api.post<Demande>("/api/demandes", payload)).data,
    onSuccess: (d) => {
      toast("success", `Demande envoyée (${d.nb_jours_ouvres} jour${d.nb_jours_ouvres > 1 ? "s" : ""}).`);
      setForm({ type_absence_id: 1, date_debut: "", date_fin: "", motif: "" });
      qc.invalidateQueries({ queryKey: ["mes-demandes"] });
      qc.invalidateQueries({ queryKey: ["soldes"] });
    },
    onError: (e: AxiosError<{ detail: string }>) => toast("error", e.response?.data?.detail ?? "Erreur lors de la création."),
  });

  const annuler = useMutation({
    mutationFn: async (id: number) => api.patch(`/api/demandes/${id}/annuler`),
    onSuccess: () => {
      toast("info", "Demande annulée.");
      qc.invalidateQueries({ queryKey: ["mes-demandes"] });
      qc.invalidateQueries({ queryKey: ["soldes"] });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mes demandes</h1>
        <p className="text-sm text-slate-500">Posez une demande et suivez vos soldes.</p>
      </div>

      {/* Soldes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        {soldes.data?.map((s) => (
          <div key={s.type_absence_id} className="card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <IconWallet className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{libelleType(s.type_absence_id)}</p>
              <p className="text-2xl font-bold text-ink">{s.jours_restants} <span className="text-sm font-medium text-slate-400">jours restants</span></p>
              <p className="text-xs text-slate-400">{s.jours_pris} pris · {s.jours_acquis} acquis</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <IconPlus className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-ink">Nouvelle demande</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); creer.mutate(form); }} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Type d'absence</label>
            <select value={form.type_absence_id} onChange={(e) => setForm({ ...form, type_absence_id: Number(e.target.value) })} className="input">
              {Object.entries(TYPES_ABSENCE).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div className="hidden sm:block" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date de début</label>
            <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date de fin</label>
            <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="input" required />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Motif (optionnel)</label>
            <input type="text" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className="input" placeholder="Vacances, rendez-vous…" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={creer.isPending} className="btn-primary">
              {creer.isPending ? "Envoi…" : "Envoyer la demande"}
            </button>
          </div>
        </form>
      </div>

      {/* Historique */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">Historique</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Période</th>
                <th className="px-4 py-3 font-semibold">Jours</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demandes.data?.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-ink">{libelleType(d.type_absence_id)}</td>
                  <td className="px-4 py-3 text-slate-600">{d.date_debut} → {d.date_fin}</td>
                  <td className="px-4 py-3 text-slate-600">{d.nb_jours_ouvres}</td>
                  <td className="px-4 py-3"><StatutBadge statut={d.statut} /></td>
                  <td className="px-4 py-3 text-right">
                    {(d.statut === "SOUMISE" || d.statut === "VALIDEE") && (
                      <button onClick={() => annuler.mutate(d.id)} className="text-xs font-medium text-rose-600 hover:underline">Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
              {demandes.data?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Aucune demande pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
