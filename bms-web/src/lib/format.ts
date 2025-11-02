/**
 * Fonctions de formatage utilitaires
 */

export function formatNumber(value: number): string {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatCurrency(value: number, currency = 'FCFA'): string {
  if (value === null || value === undefined) return `0 ${currency}`;
  return `${formatNumber(value)} ${currency}`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
}
