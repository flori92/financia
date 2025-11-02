import clsx from "clsx";
import React from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  emptyLabel?: string;
};

export function SimpleTable<T extends Record<string, any>>({ columns, data, emptyLabel = "Aucune donnée" }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-app-border">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className={clsx("px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border bg-white">
          {data.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-sm text-slate-500" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              {columns.map((col) => (
                <td key={String(col.key)} className={clsx("px-4 py-2 text-sm text-slate-700", col.className)}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
