import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '@finpay360/shared-types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    const correlationId = request.correlationId || (request.headers['x-correlation-id'] as string);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected internal error occurred. Please contact support.';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        errorMessage = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        errorMessage = (resObj.message as string) || exception.message;
        errorCode = (resObj.error as string) || exception.name.toUpperCase().replace(/\s+/g, '_');
        if (Array.isArray(resObj.message)) {
          errorMessage = resObj.message.join(', ');
          details = resObj.message;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${correlationId}] Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    }

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        correlationId,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}
