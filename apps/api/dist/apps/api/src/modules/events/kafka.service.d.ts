import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { BaseDomainEvent } from "@finpay360/shared-types";
export declare class KafkaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private isConnected;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publish<T>(topic: string, partitionKey: string, event: BaseDomainEvent<T>): Promise<boolean>;
    dispatchToDlq(topic: string, originalEvent: unknown, errorReason: string): Promise<void>;
}
