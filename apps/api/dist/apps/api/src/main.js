"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization, Idempotency-Key, X-Correlation-Id',
    });
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FinPay360 — Enterprise FinTech Operations API')
        .setDescription('Production-grade RESTful API Gateway for Banking Operations, Multi-Rail Payments, Double-Entry Ledger, and Real-Time Fraud Intelligence.')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map