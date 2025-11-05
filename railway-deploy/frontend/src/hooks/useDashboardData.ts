"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";

export type DashboardMetrics = {
  kpiMonth: {
    revenue: number;
    expenses: number;
    netIncome: number;
    margin: number;
  };
  evolutionChart: { month: string; revenue: number; expenses: number }[];
  topClients: { name: string; amount: number }[];
  topSuppliers: { name: string; amount: number }[];
  financialRatios: {
    currentAssets: number;
    currentLiabilities: number;
    equity: number;
    totalLiabilities: number;
    liquidityRatio: number;
    solvencyRatio: number;
  };
  alerts: { type: "danger" | "warning" | "info"; title: string; message: string }[];
  recentActivity: {
    entries: { date: string; description: string; amount: number; type: string }[];
  };
};

export type TreasuryForecast = {
  series?: { date: string; net?: number; revenue?: number; expenses?: number; balance?: number }[];
  summary?: { currentBalance?: number };
};

export type TreasuryAlerts = {
  alerts?: { level: string; title: string; message: string }[];
  metrics?: { runwayDays?: number; net?: number; balance?: number };
};

export type AgedBalance = {
  totals?: {
    total?: number;
    current?: number;
    days30_60?: number;
    days60_90?: number;
    over90?: number;
  };
};

export type BankTransaction = {
  id: string;
  status: "pending" | "reconciled" | "ignored";
  amount?: number;
  transactionDate?: string;
};

export type VatReturn = {
  vatCollected?: number;
  vatDeductible?: number;
  netVat?: number;
  sales?: { totalHt: number };
};

export type LastClosure = {
  endDate?: string;
  status?: string;
};

export type DashboardData = {
  metrics?: DashboardMetrics;
  forecast?: TreasuryForecast;
  treasuryAlerts?: TreasuryAlerts;
  lastClosure?: LastClosure;
  vat?: VatReturn;
  agedReceivables?: AgedBalance;
  agedPayables?: AgedBalance;
  bankingTransactions?: BankTransaction[];
};

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setError("Aucune société sélectionnée");
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    try {
      const [metrics, forecast, alerts, lastClosure, vat, agedReceivables, agedPayables, bankingTx] = await Promise.allSettled([
        apiGet("/api/v1/accounting/dashboard/metrics", { companyId }),
        apiGet("/api/v1/treasury/forecast", { companyId }),
        apiGet("/api/v1/treasury/alerts", { companyId }),
        apiGet("/api/v1/accounting/close/last", { companyId }),
        apiGet("/api/v1/tax/vat/return", { companyId, startDate: start, endDate: end }),
        apiGet("/api/v1/accounting/aged-balance", { companyId, type: "receivables", asOfDate: end }),
        apiGet("/api/v1/accounting/aged-balance", { companyId, type: "payables", asOfDate: end }),
        apiGet("/api/v1/banking/transactions", { companyId })
      ]);

      const next: DashboardData = {};

      if (metrics.status === "fulfilled") {
        next.metrics = metrics.value as DashboardMetrics;
      } else {
        throw metrics.reason;
      }

      if (forecast.status === "fulfilled") {
        next.forecast = forecast.value as TreasuryForecast;
      }

      if (alerts.status === "fulfilled") {
        next.treasuryAlerts = alerts.value as TreasuryAlerts;
      }

      if (lastClosure.status === "fulfilled") {
        next.lastClosure = lastClosure.value as LastClosure;
      }

      if (vat.status === "fulfilled") {
        next.vat = vat.value as VatReturn;
      }

      if (agedReceivables.status === "fulfilled") {
        next.agedReceivables = agedReceivables.value as AgedBalance;
      }

      if (agedPayables.status === "fulfilled") {
        next.agedPayables = agedPayables.value as AgedBalance;
      }

      if (bankingTx.status === "fulfilled") {
        next.bankingTransactions = (bankingTx.value as BankTransaction[]) || [];
      }

      setData(next);
    } catch (err: any) {
      setError(typeof err?.message === "string" ? err.message : "Impossible de charger le dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("bms-company-changed", handler);
    return () => window.removeEventListener("bms-company-changed", handler);
  }, [load]);

  return {
    loading,
    error,
    data,
    reload: load
  };
}
