import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const COMPTES = [
  { email: "salarie@congesflow.fr", role: "Salarié" },
  { email: "manager@congesflow.fr", role: "Manager" },
  { email: "rh@congesflow.fr", role: "RH" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("salarie@congesflow.fr");
  const [motDePasse, setMotDePasse] = useState("Password123");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setLoading(true);
    try {
      await login(email, motDePasse);
      navigate("/");
    } catch {
      setErreur("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau gauche (présentation) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold">C</div>
          <span className="text-lg font-bold">CongésFlow</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight">Gérez vos congés<br />en toute simplicité.</h1>
          <p className="mt-4 max-w-md text-slate-300">Posez vos demandes, suivez vos soldes et laissez vos managers valider — le tout dans une interface claire et sécurisée.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-200">
            <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Calcul automatique des jours ouvrés et fériés</li>
            <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Workflow de validation tracé</li>
            <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Tableau de bord pour les managers et RH</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">Titre Professionnel CDA — Projet de fin d'études</p>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
      </div>

      {/* Panneau droit (formulaire) */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="text-2xl font-bold text-brand-700">CongésFlow</span>
          </div>
          <h2 className="text-2xl font-bold text-ink">Connexion</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Accédez à votre espace.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
              <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="input" required />
            </div>
            {erreur && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erreur}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Comptes de démonstration</p>
            <div className="space-y-1.5">
              {COMPTES.map((c) => (
                <button
                  key={c.email}
                  onClick={() => { setEmail(c.email); setMotDePasse("Password123"); }}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="text-slate-600">{c.email}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{c.role}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">Mot de passe : <code className="font-mono">Password123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
