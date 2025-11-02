import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule } from '@nestjs/config';

// Module minimaliste
import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class AppController {
  @Get('/health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 3001,
      service: 'bms-api-gateway',
      version: '1.0.0-minimal'
    };
  }

  @Get('/api/v1/test')
  getTest() {
    return {
      message: 'BMS API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    };
  }

  @Get('/api/v1/companies')
  getCompanies() {
    return [
      {
        id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
        name: 'BMS Demo SARL',
        legalName: 'BMS Demo Société à Responsabilité Limitée',
        registrationNumber: 'BJS123456789',
        taxId: 'BJS987654321',
        industry: 'Services Numériques',
        size: 'small',
        addressLine1: '123 Rue du Commerce, Cotonou, Bénin',
        city: 'Cotonou',
        postalCode: '',
        country: 'BJ',
        phone: '+229 12345678',
        email: 'demo@bms.bj',
        website: 'https://bms-demo.bj',
        vatRate: 0.18,
        fiscalYearStart: '2025-01-01',
        defaultCurrency: 'XOF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
})
class AppModule {}

async function bootstrap() {
  try {
    console.log('Starting BMS API Gateway (Minimal Version)...');
    
    const app = await NestFactory.create(AppModule);

    // CORS - Configuration permissive pour Railway
    app.enableCors({
      origin: true, // Autoriser toutes les origines
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    console.log('CORS enabled for all origins');

    // Validation globale
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger Documentation
    const config = new DocumentBuilder()
      .setTitle('BMS API')
      .setDescription('API Gateway pour BMS - Business Management System (Minimal)')
      .setVersion('1.0.0-minimal')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    console.log(`PORT env var: ${process.env.PORT}`);
    console.log(`Using port: ${port}`);
    
    await app.listen(port, '0.0.0.0');

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   BMS - API Gateway (Minimal)                     ║
║   Status: ✅ RUNNING                                   ║
║   Port: ${port}                                    ║
║   Environment: ${process.env.NODE_ENV || 'unknown'}           ║
║                                                       ║
║   Health: GET /health                                ║
║   API Docs: GET /api/docs                            ║
║   Test: GET /api/v1/test                             ║
║   Companies: GET /api/v1/companies                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    console.log('✅ BMS API Gateway (Minimal) started successfully!');

  } catch (error) {
    console.error('❌ Failed to start BMS API Gateway:', error);
    process.exit(1);
  }
}

bootstrap();
