// @/components/ui/Toast.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "warn" | "error";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-eliminar el toast después de 4 segundos
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Contenedor flotante de Toasts (Responsivo: abajo al centro en mobile, arriba a la derecha en desktop) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 shadow-3xl animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success"
                ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                : toast.type === "warn"
                  ? "border-amber-300 bg-amber-100 text-amber-950"
                  : "border-red-300 bg-red-100 text-red-950"
            }`}
          >
            {/* Íconos según el tipo de alerta */}
            {toast.type === "success" && (
              <svg
                className="h-5 w-5 shrink-0 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {toast.type === "warn" && (
              <svg
                className="h-5 w-5 shrink-0 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="h-5 w-5 shrink-0 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}

            <p className="text-sm font-medium">{toast.message}</p>

            {/* Botón cerrar manual */}
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="ml-auto p-1 rounded-md hover:bg-black/5 opacity-60 hover:opacity-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook personalizado para consumir el toast fácilmente en cualquier lado
export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  return context;
}
