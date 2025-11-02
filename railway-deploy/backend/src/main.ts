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

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // En développement, autoriser tout
      if (process.env.NODE_ENV !== 'production') {
        console.log(`CORS: Allowing origin ${origin} (development mode)`);
        return callback(null, true);
      }
      
      // En production, vérifier les origines autorisées
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS: Allowing origin ${origin} (production mode)`);
        callback(null, true);
      } else {
        console.log(`CORS: Blocked origin ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'X-Requested-With',
      'X-API-Key'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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

  const port = 3001; // Forcer le port 3001 pour Railway
  console.log(`🔍 PORT env var: ${process.env.PORT}`);
  console.log(`🔍 Using port: ${port}`);
  await app.listen(port, '0.0.0.0');

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   💼 BMS - API Gateway                               ║
║                                                       ║
║   🚀 Server running on: http://localhost:${port}      ║
║   📚 API Docs: http://localhost:${port}/api/docs      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
