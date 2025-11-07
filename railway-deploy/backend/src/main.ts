import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

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

  // CORS - Autorise mobile, web et Railway
  app.enableCors({
    origin: [
      'http://localhost:3000', // Web admin
      'http://localhost:19006', // Expo
      'capacitor://localhost', // Capacitor mobile
      'ionic://localhost',
      /^https:\/\/.*\.bms\.com$/, // Production
      /^https:\/\/.*\.up\.railway\.app$/, // Railway frontend
      'https://bms-frontend-production.up.railway.app', // Frontend Railway
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

  // Swagger Documentation (désactivé en production)
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 3001;
  
  if (nodeEnv !== 'production') {
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
    console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  } else {
    console.log('📚 Swagger documentation disabled in production');
  }
  
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   💼 BMS - API Gateway                               ║
║                                                       ║
║   🚀 Server running on port: ${port}                  ║
║   🌍 Environment: ${nodeEnv}                         ║
║   📚 Swagger: ${nodeEnv !== 'production' ? `http://localhost:${port}/api/docs` : 'Disabled in production'} ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  if (nodeEnv === 'production') {
    console.log('✅ Production mode enabled');
    console.log('✅ Database logging disabled');
    console.log('✅ Swagger documentation disabled');
  }
}

bootstrap();
