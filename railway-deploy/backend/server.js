const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { ValidationPipe } = require('@nestjs/common');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug'] });

  // Configuration CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Pipes de validation globaux
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('BMS ERP API')
    .setDescription('API complète pour le système ERP de gestion d\'entreprise')
    .setVersion('3.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Préfixe global pour l'API
  app.setGlobalPrefix('api/v1');

  // Port d'écoute (Railway utilise PORT env var)
  const port = process.env.PORT || 8080;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 BMS ERP Backend démarré sur le port ${port}`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api/v1/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
  console.log(`🤖 AI Status: http://localhost:${port}/api/v1/ai/ocr/status`);
}

bootstrap().catch((error) => {
  console.error('❌ Erreur au démarrage du serveur:', error);
  process.exit(1);
});
