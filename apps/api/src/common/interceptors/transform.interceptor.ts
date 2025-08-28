import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@finpay360/shared-types';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request & { correlationId?: string }>();
    const correlationId = request.correlationId;

    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse or streaming, pass through
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }

        return {
          success: true,
          data,
          correlationId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
