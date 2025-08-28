"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IdempotencyInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const idempotencyStore = new Map();
const inFlightLocks = new Set();
let IdempotencyInterceptor = IdempotencyInterceptor_1 = class IdempotencyInterceptor {
    logger = new common_1.Logger(IdempotencyInterceptor_1.name);
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const idempotencyKey = request.headers['idempotency-key'] || request.body?.idempotencyKey;
        if (!idempotencyKey || request.method !== 'POST') {
            return next.handle();
        }
        if (inFlightLocks.has(idempotencyKey)) {
            throw new common_1.ConflictException('A request with this Idempotency-Key is currently in progress. Please retry shortly.');
        }
        const cached = idempotencyStore.get(idempotencyKey);
        if (cached) {
            this.logger.log(`Idempotency cache hit for key: ${idempotencyKey}`);
            response.status(cached.status);
            response.setHeader('X-Cache-Lookup', 'HIT');
            return (0, rxjs_1.of)(cached.body);
        }
        inFlightLocks.add(idempotencyKey);
        return next.handle().pipe((0, operators_1.tap)({
            next: (body) => {
                inFlightLocks.delete(idempotencyKey);
                idempotencyStore.set(idempotencyKey, {
                    status: response.statusCode || 201,
                    body,
                    timestamp: Date.now(),
                });
            },
            error: () => {
                inFlightLocks.delete(idempotencyKey);
            },
        }));
    }
};
exports.IdempotencyInterceptor = IdempotencyInterceptor;
exports.IdempotencyInterceptor = IdempotencyInterceptor = IdempotencyInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], IdempotencyInterceptor);
//# sourceMappingURL=idempotency.interceptor.js.map