/**
 * Utilitaires de formatage sécurisés
 * Évite les erreurs runtime avec null/undefined
 */

/**
 * Formate un nombre en chaîne locale de manière sécurisée
 * @param value - Valeur à formater (peut être null/undefined)
 * @param locale - Locale à utiliser (défaut: fr-FR)
 * @param options - Options de formatage
 * @returns Chaîne formatée ou '0' si value est null/undefined
 */
export function safeToLocaleString(
  value: number | null | undefined,
  locale: string = 'fr-FR',
  options: Intl.NumberFormatOptions = {}
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0';
  }
  
  try {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options
    });
  } catch (error) {
    console.warn('Erreur de formatage:', error);
    return '0';
  }
}

/**
 * Formate un montant monétaire FCFA
 * @param value - Montant à formater
 * @returns Chaîne formatée avec "FCFA"
 */
export function formatCurrency(value: number | null | undefined): string {
  return `${safeToLocaleString(value)} FCFA`;
}

/**
 * Formate un pourcentage
 * @param value - Valeur à formater (0-100)
 * @param decimals - Nombre de décimales (défaut: 1)
 * @returns Chaîne formatée avec "%"
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0%';
  }
  
  try {
    return `${value.toFixed(decimals)}%`;
  } catch (error) {
    return '0%';
  }
}

/**
 * Vérifie si une valeur est un nombre valide
 * @param value - Valeur à vérifier
 * @returns true si c'est un nombre valide
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Calcule une somme de manière sécurisée
 * @param values - Tableau de valeurs (peut contenir null/undefined)
 * @returns Somme des nombres valides
 */
export function safeSum(values: (number | null | undefined)[]): number {
  return values.reduce((sum, value) => sum + (isValidNumber(value) ? value : 0), 0);
}

/**
 * Formate un tableau pour le map sécurisé
 * @param array - Tableau qui peut être null/undefined
 * @returns Tableau vide si null/undefined, sinon le tableau original
 */
export function safeMap<T>(array: T[] | null | undefined): T[] {
  return Array.isArray(array) ? array : [];
}

export default {
  safeToLocaleString,
  formatCurrency,
  formatPercentage,
  isValidNumber,
  safeSum,
  safeMap
};
