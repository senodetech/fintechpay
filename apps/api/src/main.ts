import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cross-Origin Resource Sharing
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, Idempotency-Key, X-Correlation-Id',
  });

  // Global Prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('FinPay360 — Enterprise FinTech Operations API')
    .setDescription(
      'Production-grade RESTful API Gateway for Banking Operations, Multi-Rail Payments, Double-Entry Ledger, and Real-Time Fraud Intelligence.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication & OAuth2 / OIDC')
    .addTag('Executive Dashboard & Telemetry')
    .addTag('Customer Management & KYC')
    .addTag('Account Management & Balances')
    .addTag('Payment Processing & Lifecycle')
    .addTag('Transaction Ledger & Journal')
    .addTag('Fraud & Risk Detection Engine')
    .addTag('In-App Notification Center')
    .addTag('Compliance & Audit Logs')
    .addTag('Health & Observability')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 FinPay360 API Gateway running at: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 OpenAPI / Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`⚡ WebSocket Server active on port: ${port}`);
  logger.log(`=======================================================`);
}

bootstrap();
