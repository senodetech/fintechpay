import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { correlationId?: string }>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl, correlationId } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const contentLength = response.get('content-length') || '';
        const elapsed = Date.now() - now;

        this.logger.log(
          `[${correlationId}] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${elapsed}ms - ${userAgent}`,
        );
      }),
    );
  }
}
