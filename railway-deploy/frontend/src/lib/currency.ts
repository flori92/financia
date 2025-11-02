/**
 * Utilitaire de gestion des devises pour OCR et affichage
 */

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'XOF' | 'XAF' | 'CAD' | 'CHF' | 'JPY' | 'CNY' | 'AUD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToXOF?: number; // Taux de conversion vers XOF (à mettre à jour)
  locale: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToXOF: 655.957, // Taux fixe BCEAO
    locale: 'fr-FR',
    decimalPlaces: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dollar américain',
    rateToXOF: 600, // Approximation
    locale: 'en-US',
    decimalPlaces: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'Livre sterling',
    rateToXOF: 750, // Approximation
    locale: 'en-GB',
    decimalPlaces: 2
  },
  XOF: {
    code: 'XOF',
    symbol: 'FCFA',
    name: 'Franc CFA BCEAO',
    rateToXOF: 1,
    locale: 'fr-FR',
    decimalPlaces: 0
  },
  XAF: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Franc CFA BEAC',
    rateToXOF: 1, // Approximation (taux similaire)
    locale: 'fr-FR',
    decimalPlaces: 0
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Dollar canadien',
    rateToXOF: 440, // Approximation
    locale: 'fr-CA',
    decimalPlaces: 2
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Franc suisse',
    rateToXOF: 650, // Approximation
    locale: 'fr-CH',
    decimalPlaces: 2
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Yen japonais',
    rateToXOF: 4, // Approximation
    locale: 'ja-JP',
    decimalPlaces: 0
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Yuan chinois',
    rateToXOF: 85, // Approximation
    locale: 'zh-CN',
    decimalPlaces: 2
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Dollar australien',
    rateToXOF: 390, // Approximation
    locale: 'en-AU',
    decimalPlaces: 2
  }
};

/**
 * Détecte la devise dans un texte OCR
 */
export function detectCurrency(text: string): CurrencyCode {
  const patterns: Record<CurrencyCode, RegExp[]> = {
    EUR: [/(?:\d+[,.]?\d*)\s*(?:€|EUR|EURO)/gi, /(?:€|EUR|EURO)\s*(?:\d+[,.]?\d*)/gi],
    USD: [/(?:\d+[,.]?\d*)\s*(?:\$|USD|DOLLAR)/gi, /(?:\$|USD|DOLLAR)\s*(?:\d+[,.]?\d*)/gi],
    GBP: [/(?:\d+[,.]?\d*)\s*(?:£|GBP|POUND)/gi, /(?:£|GBP|POUND)\s*(?:\d+[,.]?\d*)/gi],
    XOF: [/(?:\d+[,.]?\d*)\s*(?:FCFA|XOF|CFA)/gi],
    XAF: [/(?:\d+[,.]?\d*)\s*(?:FCFA|XAF)/gi],
    CAD: [/(?:\d+[,.]?\d*)\s*(?:C\$|CAD)/gi, /(?:C\$|CAD)\s*(?:\d+[,.]?\d*)/gi],
    CHF: [/(?:\d+[,.]?\d*)\s*(?:CHF|SWISS)/gi],
    JPY: [/(?:\d+[,.]?\d*)\s*(?:¥|JPY|YEN)/gi],
    CNY: [/(?:\d+[,.]?\d*)\s*(?:¥|CNY|YUAN)/gi],
    AUD: [/(?:\d+[,.]?\d*)\s*(?:A\$|AUD)/gi, /(?:A\$|AUD)\s*(?:\d+[,.]?\d*)/gi]
  };

  // Parcourir les devises par ordre de priorité (EUR, USD, puis autres)
  const priorityOrder: CurrencyCode[] = ['EUR', 'USD', 'GBP', 'XOF', 'XAF', 'CAD', 'CHF', 'JPY', 'CNY', 'AUD'];
  
  for (const currency of priorityOrder) {
    for (const pattern of patterns[currency]) {
      if (pattern.test(text)) {
        return currency;
      }
    }
  }

  // Par défaut, retourner XOF (FCFA) pour l'Afrique de l'Ouest
  return 'XOF';
}

/**
 * Extrait le montant d'un texte OCR
 */
export function extractAmount(text: string, currency?: CurrencyCode): number | null {
  const detectedCurrency = currency || detectCurrency(text);
  const currencyInfo = CURRENCIES[detectedCurrency];
  
  // Patterns pour chaque devise
  const patterns: Record<CurrencyCode, RegExp> = {
    EUR: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:€|EUR|EURO)/gi,
    USD: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:\$|USD|DOLLAR)/gi,
    GBP: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:£|GBP|POUND)/gi,
    XOF: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)\s*(?:FCFA|XOF|CFA)/gi,
    XAF: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)\s*(?:FCFA|XAF)/gi,
    CAD: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:C\$|CAD)/gi,
    CHF: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:CHF|SWISS)/gi,
    JPY: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)\s*(?:¥|JPY|YEN)/gi,
    CNY: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:¥|CNY|YUAN)/gi,
    AUD: /(?:\d{1,3}(?:[,\s]?\d{3})*(?:\.\d+)?|\d+)(?:\.\d+)?\s*(?:A\$|AUD)/gi
  };

  const match = text.match(patterns[detectedCurrency]);
  if (!match) return null;

  // Nettoyer et parser le montant
  const amountStr = match[0]
    .replace(/[^\d.,]/g, '')
    .replace(/\s/g, '')
    .replace(/,/g, (currencyInfo.locale === 'fr-FR' ? '.' : ','));

  return parseFloat(amountStr) || null;
}

/**
 * Formate un montant selon la devise
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const currencyInfo = CURRENCIES[currency];
  
  if (currency === 'XOF' || currency === 'XAF') {
    // Pour les francs CFA, pas de décimales
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} ${currencyInfo.symbol}`;
  }
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.decimalPlaces,
    maximumFractionDigits: currencyInfo.decimalPlaces
  }).format(amount);
}

/**
 * Convertit un montant vers XOF
 */
export function convertToXOF(amount: number, fromCurrency: CurrencyCode): number {
  const currencyInfo = CURRENCIES[fromCurrency];
  const rate = currencyInfo.rateToXOF || 1;
  return amount * rate;
}

/**
 * Devise par défaut selon le pays (configurable)
 */
export function getDefaultCurrency(): CurrencyCode {
  // Pour l'Afrique de l'Ouest, XOF par défaut
  // Peut être étendu pour détecter selon la localisation
  return 'XOF';
}
