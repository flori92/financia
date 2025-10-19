import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

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
  app.enableCors({
    origin: [
      'http://localhost:3000', // Web admin
      'http://localhost:19006', // Expo
      'capacitor://localhost', // Capacitor mobile
      'ionic://localhost',
      /^https:\/\/.*\.bms\.com$/, // Production
    ],
    credentials: true,
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
