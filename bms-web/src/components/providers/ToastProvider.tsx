"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  show: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, duration: 3500, variant: "info", ...toast };
    setToasts((prev) => [...prev, item]);
    // auto-hide
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, item.duration);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container */}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 px-4 py-6 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto w-full max-w-sm rounded-lg shadow-lg border p-3 bg-white " +
              (t.variant === "success"
                ? "border-emerald-200"
                : t.variant === "error"
                ? "border-rose-200"
                : "border-slate-200")
            }
          >
            {t.title && (
              <div className="text-sm font-semibold mb-0.5">
                {t.title}
              </div>
            )}
            {t.description && (
              <div className="text-sm text-slate-700">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
