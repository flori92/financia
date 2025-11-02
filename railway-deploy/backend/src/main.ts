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

  // Security headers
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

  // CORS - Autorise mobile et web
  const allowedOrigins = [
    'http://localhost:3000', // Web admin local
    'http://localhost:19006', // Expo local
    'capacitor://localhost', // Capacitor mobile
    'ionic://localhost',
    'https://bms-frontend-production.up.railway.app', // Frontend Railway
    /^https:\/\/.*\.bms\.com$/, // Production custom domain
    /^https:\/\/.*\.up\.railway\.app$/, // Railway domains
  ];

  // Support pour FRONTEND_URL depuis env
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

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

  const port = process.env.PORT || 3001;
  await app.listen(port);

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
