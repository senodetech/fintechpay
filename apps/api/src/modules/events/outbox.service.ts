import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { BaseDomainEvent } from '@finpay360/shared-types';

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

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private outboxQueue: OutboxRecord[] = [];

  constructor(private readonly kafkaService: KafkaService) {}

  public enqueue(event: BaseDomainEvent): void {
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
    // Immediately trigger asynchronous dispatch
    this.processPendingEvents();
  }

  public async processPendingEvents(): Promise<number> {
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
      } catch (err) {
        record.retryCount++;
        if (record.retryCount > 3) {
          record.status = 'FAILED';
          await this.kafkaService.dispatchToDlq(
            'outbox-failures',
            record,
            (err as Error).message,
          );
        }
      }
    }
    return pending.length;
  }
}
