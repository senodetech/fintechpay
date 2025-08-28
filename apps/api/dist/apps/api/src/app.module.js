"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./database/prisma.service");
const mock_db_service_1 = require("./database/mock-db.service");
const auth_module_1 = require("./modules/auth/auth.module");
const customers_module_1 = require("./modules/customers/customers.module");
const accounts_module_1 = require("./modules/accounts/accounts.module");
const payments_module_1 = require("./modules/payments/payments.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const fraud_module_1 = require("./modules/fraud/fraud.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const audit_module_1 = require("./modules/audit/audit.module");
const events_module_1 = require("./modules/events/events.module");
const health_module_1 = require("./modules/health/health.module");
const correlation_id_middleware_1 = require("./common/middleware/correlation-id.middleware");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(correlation_id_middleware_1.CorrelationIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            auth_module_1.AuthModule,
            customers_module_1.CustomersModule,
            accounts_module_1.AccountsModule,
            payments_module_1.PaymentsModule,
            transactions_module_1.TransactionsModule,
            fraud_module_1.FraudModule,
            dashboard_module_1.DashboardModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            events_module_1.EventsModule,
            health_module_1.HealthModule,
        ],
        providers: [
            prisma_service_1.PrismaService,
            mock_db_service_1.MockDbService,
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map