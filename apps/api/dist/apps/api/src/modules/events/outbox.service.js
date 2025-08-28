"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OutboxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxService = void 0;
const common_1 = require("@nestjs/common");
const kafka_service_1 = require("./kafka.service");
let OutboxService = OutboxService_1 = class OutboxService {
    kafkaService;
    logger = new common_1.Logger(OutboxService_1.name);
    outboxQueue = [];
    constructor(kafkaService) {
        this.kafkaService = kafkaService;
    }
    enqueue(event) {
        this.outboxQueue.push({
            id: event.eventId,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            eventType: event.eventType,
            payload: event.payload,
            status: 'PENDING',
            retryCount: 0,
            createdAt: new Date().toISOString(),
        });
        this.processPendingEvents();
    }
    async processPendingEvents() {
        const pending = this.outboxQueue.filter((e) => e.status === 'PENDING');
        for (const record of pending) {
            try {
                const topic = record.eventType.split('.')[0] || 'finpay-events';
                await this.kafkaService.publish(topic, record.aggregateId, {
                    eventId: record.id,
                    eventType: record.eventType,
                    aggregateId: record.aggregateId,
                    aggregateType: record.aggregateType,
                    timestamp: record.createdAt,
                    payload: record.payload,
                });
                record.status = 'PUBLISHED';
            }
            catch (err) {
                record.retryCount++;
                if (record.retryCount > 3) {
                    record.status = 'FAILED';
                    await this.kafkaService.dispatchToDlq('outbox-failures', record, err.message);
                }
            }
        }
        return pending.length;
    }
};
exports.OutboxService = OutboxService;
exports.OutboxService = OutboxService = OutboxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_service_1.KafkaService])
], OutboxService);
//# sourceMappingURL=outbox.service.js.map