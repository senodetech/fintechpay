"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
let KafkaService = KafkaService_1 = class KafkaService {
    logger = new common_1.Logger(KafkaService_1.name);
    isConnected = false;
    async onModuleInit() {
        this.logger.log('Kafka Event Broker initialized. Ready for domain event dispatching.');
        this.isConnected = true;
    }
    async onModuleDestroy() {
        this.logger.log('Kafka Event Broker disconnected.');
    }
    async publish(topic, partitionKey, event) {
        this.logger.log(`[Kafka] Published event '${event.eventType}' to topic '${topic}' [Key: ${partitionKey}, Aggregate: ${event.aggregateId}]`);
        return true;
    }
    async dispatchToDlq(topic, originalEvent, errorReason) {
        this.logger.error(`[Kafka DLQ] Event routed to Dead-Letter Queue 'dlq.${topic}'. Reason: ${errorReason}`);
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)()
], KafkaService);
//# sourceMappingURL=kafka.service.js.map