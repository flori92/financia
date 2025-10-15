"use client";
import { useState } from "react";
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
