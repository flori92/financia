/**
 * Configuration Railway pour BMS
 * 
 * Ce fichier centralise la configuration pour Railway
 * avec support automatique des variables d'environnement Railway
 */

import { registerAs } from '@nestjs/config';

export default registerAs('railway', () => ({
  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || process.env.REDISHOST,
    port: parseInt(process.env.REDIS_PORT || process.env.REDISPORT || '6379'),
    password: process.env.REDIS_PASSWORD || process.env.REDISPASSWORD,
    user: process.env.REDIS_USER || process.env.REDISUSER || 'default',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || process.env.PGHOST,
    port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || '5432'),
    user: process.env.DATABASE_USER || process.env.PGUSER,
    password: process.env.DATABASE_PASSWORD || process.env.PGPASSWORD,
    name: process.env.DATABASE_NAME || process.env.PGDATABASE,
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL_DEFAULT || '300'),
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000'),
    preloadEnabled: process.env.DASHBOARD_PRELOAD_ENABLED === 'true',
    preloadInterval: parseInt(process.env.DASHBOARD_PRELOAD_INTERVAL || '300000'),
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
}));

