import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-700">CongésFlow</h1>
        <p className="mb-6 text-sm text-slate-500">Connectez-vous pour gérer vos congés.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          {erreur && <p className="text-sm text-rose-600">{erreur}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-xs text-slate-400">
          Démo : salarie@ / manager@ / rh@congesflow.fr — mot de passe <code>Password123</code>
        </p>
      </div>
    </div>
  );
}
