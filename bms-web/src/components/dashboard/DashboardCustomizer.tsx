"use client";

import { useState } from "react";
import { Settings, X, Eye, EyeOff } from "lucide-react";

type WidgetConfig = {
  id: string;
  title: string;
  visible: boolean;
  category: string;
};

type DashboardCustomizerProps = {
  widgets: WidgetConfig[];
  onUpdate: (widgets: WidgetConfig[]) => void;
};

export function DashboardCustomizer({ widgets, onUpdate }: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = (id: string) => {
    onUpdate(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const categories = Array.from(new Set(widgets.map(w => w.category)));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-white/30 rounded-lg hover:bg-white/90 transition-colors"
        title="Personnaliser le tableau de bord"
      >
        <Settings className="w-4 h-4" />
        <span className="font-medium">Personnaliser</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Personnaliser le dashboard</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="font-semibold mb-3 text-gray-700">{category}</h3>
                  <div className="space-y-2">
                    {widgets.filter(w => w.category === category).map(widget => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-sm">{widget.title}</span>
                        <button
                          onClick={() => toggleWidget(widget.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                            widget.visible
                              ? "bg-[#0D9488] text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {widget.visible ? "Visible" : "Masqué"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
