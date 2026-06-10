import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, tokenStore } from "../api/client";
import type { Employe } from "../api/types";

interface AuthState {
  user: Employe | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employe | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session au chargement si un token existe
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<Employe>("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, motDePasse: string) {
    const { data } = await api.post<{ access_token: string }>("/api/auth/login", {
      email,
      mot_de_passe: motDePasse,
    });
    tokenStore.set(data.access_token);
    const me = await api.get<Employe>("/api/auth/me");
    setUser(me.data);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit etre utilise dans AuthProvider");
  return ctx;
}
