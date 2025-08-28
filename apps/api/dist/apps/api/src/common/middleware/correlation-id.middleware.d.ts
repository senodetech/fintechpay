import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export interface CustomRequest extends Request {
    correlationId?: string;
}
export declare class CorrelationIdMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction): void;
}
