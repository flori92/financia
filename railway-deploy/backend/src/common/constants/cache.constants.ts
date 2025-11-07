/**
 * Constantes pour le système de cache
 */

/**
 * TTL (Time To Live) adaptatif par type de données
 */
export const CACHE_TTL = {
  // Données très dynamiques (mises à jour fréquentes)
  REALTIME: 30,              // 30 secondes
  TRANSACTIONS: 60,          // 1 minute
  ACTIVITIES: 120,           // 2 minutes
  
  // Données modérément dynamiques
  KPIS: 300,                 // 5 minutes
  CHARTS: 600,               // 10 minutes
  ALERTS: 180,               // 3 minutes
  
  // Données relativement statiques
  RATIOS: 1800,              // 30 minutes
  TOP_CLIENTS: 3600,         // 1 heure
  FINANCIAL_RATIOS: 3600,    // 1 heure
  
  // Données statiques
  COMPANY_INFO: 86400,       // 24 heures
  CHART_OF_ACCOUNTS: 86400,  // 24 heures
} as const;

/**
 * Patterns de clés de cache
 */
export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD: (companyId: string, profile: string, widget?: string) => 
    widget 
      ? `dashboard:${companyId}:${profile}:${widget}`
      : `dashboard:${companyId}:${profile}:full`,
  
  // KPIs
  KPI: (companyId: string, type: string, period: string) => 
    `kpi:${companyId}:${type}:${period}`,
  
  // Agrégations
  AGGREGATE: (companyId: string, entity: string, date: string) => 
    `aggregate:${companyId}:${entity}:${date}`,
  
  // Temps réel
  REALTIME: (companyId: string, channel: string) => 
    `realtime:${companyId}:${channel}`,
  
  // Tags pour invalidation
  TAG_COMPANY: (companyId: string) => `cache:company:${companyId}:*`,
  TAG_MODULE: (companyId: string, module: string) => 
    `cache:company:${companyId}:${module}:*`,
} as const;

/**
 * Tags d'invalidation par entité
 */
export const INVALIDATION_TAGS = {
  'journal-entry': ['accounting', 'dashboard', 'kpi'],
  'contact': ['crm', 'dashboard'],
  'transaction': ['treasury', 'dashboard', 'kpi'],
  'invoice': ['accounting', 'dashboard', 'kpi'],
  'payment': ['treasury', 'accounting', 'dashboard'],
  'opportunity': ['crm', 'dashboard'],
  'employee': ['hr', 'dashboard'],
  'leave-request': ['hr', 'dashboard'],
} as const;

