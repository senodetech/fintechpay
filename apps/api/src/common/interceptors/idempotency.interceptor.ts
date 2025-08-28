import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

// In-memory / distributed idempotency store
const idempotencyStore = new Map<string, { status: number; body: unknown; timestamp: number }>();
const inFlightLocks = new Set<string>();

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const idempotencyKey =
      (request.headers['idempotency-key'] as string) || (request.body?.idempotencyKey as string);

    if (!idempotencyKey || request.method !== 'POST') {
      return next.handle();
    }

    // Check if duplicate request is currently being processed
    if (inFlightLocks.has(idempotencyKey)) {
      throw new ConflictException(
        'A request with this Idempotency-Key is currently in progress. Please retry shortly.',
      );
    }

    // Check if result is already cached
    const cached = idempotencyStore.get(idempotencyKey);
    if (cached) {
      this.logger.log(`Idempotency cache hit for key: ${idempotencyKey}`);
      response.status(cached.status);
      response.setHeader('X-Cache-Lookup', 'HIT');
      return of(cached.body);
    }

    // Acquire in-flight lock
    inFlightLocks.add(idempotencyKey);

    return next.handle().pipe(
      tap({
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
      }),
    );
  }
}
