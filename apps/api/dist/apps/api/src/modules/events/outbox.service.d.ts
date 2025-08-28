import { KafkaService } from './kafka.service';
import { BaseDomainEvent } from "@finpay360/shared-types";
export interface OutboxRecord {
    id: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: unknown;
    status: 'PENDING' | 'PUBLISHED' | 'FAILED';
    retryCount: number;
    createdAt: string;
}
export declare class OutboxService {
    private readonly kafkaService;
    private readonly logger;
    private outboxQueue;
    constructor(kafkaService: KafkaService);
    enqueue(event: BaseDomainEvent): void;
    processPendingEvents(): Promise<number>;
}
