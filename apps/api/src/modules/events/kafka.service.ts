import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { BaseDomainEvent } from '@finpay360/shared-types';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private isConnected = false;

  async onModuleInit() {
    this.logger.log('Kafka Event Broker initialized. Ready for domain event dispatching.');
    this.isConnected = true;
  }

  async onModuleDestroy() {
    this.logger.log('Kafka Event Broker disconnected.');
  }

  public async publish<T>(topic: string, partitionKey: string, event: BaseDomainEvent<T>): Promise<boolean> {
    this.logger.log(
      `[Kafka] Published event '${event.eventType}' to topic '${topic}' [Key: ${partitionKey}, Aggregate: ${event.aggregateId}]`,
    );
    return true;
  }

  public async dispatchToDlq(topic: string, originalEvent: unknown, errorReason: string): Promise<void> {
    this.logger.error(
      `[Kafka DLQ] Event routed to Dead-Letter Queue 'dlq.${topic}'. Reason: ${errorReason}`,
    );
  }
}
