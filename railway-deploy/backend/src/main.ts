import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

// Polyfill pour le module crypto Node.js (nécessaire pour @nestjs/schedule sur Railway)
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Configuration simplifiée et robuste
  const allowedOrigins = [
    'https://bms-frontend-production.up.railway.app',
    'https://bms-production-d9e9.up.railway.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  console.log(`CORS Configuration:`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - Allowed Origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      console.log(`CORS Request from origin: ${origin || 'no origin (direct/mobile)'}`);

      // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
      if (!origin) {
        console.log(`CORS: Allowing request without origin`);
        return callback(null, true);
      }

      // En développement, autoriser tout
      if (process.env.NODE_ENV !== 'production') {
        console.log(`CORS: Allowing origin ${origin} (development mode)`);
        return callback(null, true);
      }

      // En production, vérifier les origines autorisées
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS: Allowing origin ${origin} (production mode - whitelisted)`);
        return callback(null, true);
      } else {
        console.error(`CORS: BLOCKED origin ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
        // Ne pas throw d'erreur, juste bloquer silencieusement
        return callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-API-Key',
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours cache for preflight requests
  });

  // Security headers (après CORS pour éviter les conflits)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefix API
  app.setGlobalPrefix('api/v1');

  // Endpoint health racine pour diagnostic Railway
  app.getHttpServer().on('request', (req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3001
      }));
      return;
    }
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('BMS API')
    .setDescription('API Gateway pour BMS - Business Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et autorisation')
    .addTag('companies', 'Gestion des entreprises')
    .addTag('invoices', 'Facturation')
    .addTag('payments', 'Paiements et Mobile Money')
    .addTag('accounting', 'Comptabilité OHADA')
    .addTag('sync', 'Synchronisation offline')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001; // Utiliser le port Railway ou 3001 par défaut
  console.log(`PORT env var: ${process.env.PORT}`);
  console.log(`Using port: ${port}`);
  await app.listen(port, '0.0.0.0');

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   BMS - API Gateway                               ║
║                                                       ║
║   Server running on: http://localhost:${port}      ║
║   API Docs: http://localhost:${port}/api/docs      ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
