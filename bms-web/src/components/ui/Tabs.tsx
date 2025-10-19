"use client";
import { useState, createContext, useContext, ReactNode } from "react";
import clsx from "clsx";

export type Tab = { id: string; label: string };

type TabsProps = {
  tabs: Tab[];
  defaultId?: string;
  onChange?: (id: string) => void;
};

export function Tabs({ tabs, defaultId, onChange }: TabsProps) {
  const [active, setActive] = useState<string>(defaultId ?? tabs[0]?.id);
  const set = (id: string) => {
    setActive(id);
    onChange?.(id);
  };
  return (
    <div className="border-b border-app-border">
      <div className="flex items-center gap-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => set(t.id)}
            className={clsx(
              "-mb-px py-3 text-sm font-medium",
              active === t.id
                ? "text-slate-900 border-b-2 border-app-primary"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Context pour les nouveaux composants
const TabsContext = createContext<{ value: string; onValueChange: (v: string) => void } | null>(null);

export function TabsRoot({ defaultValue, onValueChange, children }: { defaultValue?: string; onValueChange?: (v: string) => void; children: ReactNode }) {
  const [value, setValue] = useState(defaultValue || '');
  const handleChange = (v: string) => {
    setValue(v);
    onValueChange?.(v);
  };
  return <TabsContext.Provider value={{ value, onValueChange: handleChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("flex items-center gap-2 border-b border-app-border", className)}>{children}</div>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      onClick={() => ctx?.onValueChange(value)}
      className={clsx(
        "px-4 py-2 text-sm font-medium -mb-px",
        isActive ? "text-slate-900 border-b-2 border-app-primary" : "text-slate-500 hover:text-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className="py-4">{children}</div>;
}
