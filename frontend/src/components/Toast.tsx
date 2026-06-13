import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { IconCheck, IconX } from "./icons";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; type: ToastType; message: string; }

const ToastContext = createContext<(type: ToastType, message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-soft animate-[slidein_0.2s_ease-out] ${
              t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-rose-600" : "bg-brand-600"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              {t.type === "error" ? <IconX className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
