# 📅 Guide d'Implémentation - Module Congés

**Objectif:** Créer une interface complète et moderne pour la gestion des congés  
**Durée estimée:** 5 jours  
**Prérequis:** Backend congés déjà implémenté ✅

---

## 🎯 Vue d'Ensemble

### Fonctionnalités à Implémenter
1. **Liste des demandes** avec filtres avancés
2. **Création de demande** avec validation en temps réel
3. **Workflow d'approbation** multi-niveaux
4. **Calendrier visuel** des congés
5. **Gestion des soldes** par employé

### Architecture Frontend
```
bms-web/src/
├── app/hr/leaves/
│   ├── page.tsx                    # Liste des demandes
│   ├── [id]/page.tsx              # Détails d'une demande
│   ├── new/page.tsx               # Création
│   └── calendar/page.tsx          # Vue calendrier
├── components/hr/
│   ├── LeaveRequestCard.tsx       # Carte de demande
│   ├── LeaveStatusBadge.tsx       # Badge de statut
│   ├── LeaveApprovalFlow.tsx      # Workflow visuel
│   ├── LeaveCalendar.tsx          # Calendrier
│   ├── LeaveBalanceCard.tsx       # Solde
│   └── LeaveFilters.tsx           # Filtres
└── hooks/
    ├── useLeaves.ts               # Hook pour les demandes
    ├── useLeaveApproval.ts        # Hook pour approbations
    └── useLeaveBalance.ts         # Hook pour soldes
```

---

## 📝 Étape 1: Types et Interfaces

**Créer:** `bms-web/src/types/leave.ts`

```typescript
export enum LeaveStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  PARENTAL = 'parental',
}

export interface LeaveApproval {
  id: string;
  stepOrder: number;
  role: string;
  approverId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  decidedAt?: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  status: LeaveStatus;
  approvals: LeaveApproval[];
  currentStep: number;
  currentApproverId?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  annual: {
    total: number;
    taken: number;
    remaining: number;
  };
  sick: {
    total: number;
    taken: number;
    remaining: number;
  };
}
```

---

## 🎨 Étape 2: Composants de Base

### 2.1 Badge de Statut

**Créer:** `bms-web/src/components/hr/LeaveStatusBadge.tsx`


```typescript
import { LeaveStatus } from '@/types/leave';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function LeaveStatusBadge({ status, className = '' }: LeaveStatusBadgeProps) {
  const config = {
    [LeaveStatus.DRAFT]: {
      label: 'Brouillon',
      className: 'bg-gray-100 text-gray-700',
    },
    [LeaveStatus.PENDING]: {
      label: 'En attente',
      className: 'bg-amber-100 text-amber-700',
    },
    [LeaveStatus.APPROVED]: {
      label: 'Approuvé',
      className: 'bg-green-100 text-green-700',
    },
    [LeaveStatus.REJECTED]: {
      label: 'Rejeté',
      className: 'bg-red-100 text-red-700',
    },
    [LeaveStatus.CANCELLED]: {
      label: 'Annulé',
      className: 'bg-gray-100 text-gray-500',
    },
  };

  const { label, className: statusClass } = config[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass} ${className}`}>
      {label}
    </span>
  );
}
```

### 2.2 Carte de Solde

**Créer:** `bms-web/src/components/hr/LeaveBalanceCard.tsx`

```typescript
import { LeaveBalance } from '@/types/leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  loading?: boolean;
}

export function LeaveBalanceCard({ balance, loading }: LeaveBalanceCardProps) {
  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Congés Annuels */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Congés Annuels</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-semibold">{balance.annual.total} jours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pris</span>
            <span className="text-lg font-semibold text-orange-600">
              {balance.annual.taken} jours
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm font-medium text-gray-900">Restant</span>
            <span className="text-2xl font-bold text-green-600">
              {balance.annual.remaining} jours
            </span>
          </div>
        </div>
        {/* Barre de progression */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${(balance.annual.remaining / balance.annual.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Congés Maladie */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Congés Maladie</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-semibold">{balance.sick.total} jours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pris</span>
            <span className="text-lg font-semibold text-orange-600">
              {balance.sick.taken} jours
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm font-medium text-gray-900">Restant</span>
            <span className="text-2xl font-bold text-blue-600">
              {balance.sick.remaining} jours
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(balance.sick.remaining / balance.sick.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Carte de Demande

**Créer:** `bms-web/src/components/hr/LeaveRequestCard.tsx`

```typescript
import Link from 'next/link';
import { Calendar, User, Clock } from 'lucide-react';
import { Leave, LeaveType } from '@/types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LeaveRequestCardProps {
  leave: Leave;
}

const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Congés annuels',
  [LeaveType.SICK]: 'Congé maladie',
  [LeaveType.UNPAID]: 'Congé sans solde',
  [LeaveType.MATERNITY]: 'Congé maternité',
  [LeaveType.PATERNITY]: 'Congé paternité',
  [LeaveType.PARENTAL]: 'Congé parental',
};

export function LeaveRequestCard({ leave }: LeaveRequestCardProps) {
  const startDate = new Date(leave.startDate);
  const endDate = new Date(leave.endDate);

  return (
    <Link href={`/hr/leaves/${leave.id}`}>
      <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {leave.employee.firstName} {leave.employee.lastName}
              </h3>
              <p className="text-sm text-gray-500">{leave.employee.email}</p>
            </div>
          </div>
          <LeaveStatusBadge status={leave.status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{leaveTypeLabels[leave.type]}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Du {format(startDate, 'dd MMM yyyy', { locale: fr })} au{' '}
              {format(endDate, 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900">
              {leave.daysCount} jour{leave.daysCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {leave.reason && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 line-clamp-2">{leave.reason}</p>
          </div>
        )}

        {/* Workflow Progress */}
        {leave.status === 'pending' && leave.approvals && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(leave.currentStep / leave.approvals.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                Étape {leave.currentStep}/{leave.approvals.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

## 🔌 Étape 3: Hooks Personnalisés

### 3.1 Hook pour les Demandes

**Créer:** `bms-web/src/hooks/useLeaves.ts`

```typescript
import { useState, useEffect } from 'react';
import { Leave, LeaveStatus, LeaveType } from '@/types/leave';

interface UseLeavesOptions {
  companyId: string;
  status?: LeaveStatus;
  employeeId?: string;
  type?: LeaveType;
}

export function useLeaves(options: UseLeavesOptions) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, [options.companyId, options.status, options.employeeId, options.type]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: options.companyId,
        ...(options.status && { status: options.status }),
        ...(options.employeeId && { employeeId: options.employeeId }),
        ...(options.type && { type: options.type }),
      });

      const response = await fetch(`/api/v1/hr/leaves?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des demandes');

      const data = await response.json();
      setLeaves(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createLeave = async (data: Partial<Leave>) => {
    try {
      const response = await fetch('/api/v1/hr/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      const newLeave = await response.json();
      setLeaves((prev) => [newLeave, ...prev]);
      return newLeave;
    } catch (err) {
      throw err;
    }
  };

  const submitLeave = async (leaveId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/v1/hr/leaves/${leaveId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Erreur lors de la soumission');

      const updatedLeave = await response.json();
      setLeaves((prev) => prev.map((l) => (l.id === leaveId ? updatedLeave : l)));
      return updatedLeave;
    } catch (err) {
      throw err;
    }
  };

  return {
    leaves,
    loading,
    error,
    createLeave,
    submitLeave,
    refetch: fetchLeaves,
  };
}
```

### 3.2 Hook pour les Soldes

**Créer:** `bms-web/src/hooks/useLeaveBalance.ts`

```typescript
import { useState, useEffect } from 'react';
import { LeaveBalance } from '@/types/leave';

export function useLeaveBalance(companyId: string, employeeId: string) {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, [companyId, employeeId]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/hr/leaves/balance?companyId=${companyId}&employeeId=${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur lors du chargement du solde');

      const data = await response.json();
      setBalance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return { balance, loading, error, refetch: fetchBalance };
}
```

---

## 📄 Étape 4: Page Liste des Demandes

**Modifier:** `bms-web/src/app/hr/leaves/page.tsx`
