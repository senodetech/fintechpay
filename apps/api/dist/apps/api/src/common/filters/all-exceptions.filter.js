"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.correlationId || request.headers['x-correlation-id'];
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let errorMessage = 'An unexpected internal error occurred. Please contact support.';
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                errorMessage = res;
            }
            else if (typeof res === 'object' && res !== null) {
                const resObj = res;
                errorMessage = resObj.message || exception.message;
                errorCode = resObj.error || exception.name.toUpperCase().replace(/\s+/g, '_');
                if (Array.isArray(resObj.message)) {
                    errorMessage = resObj.message.join(', ');
                    details = resObj.message;
                }
            }
        }
        else if (exception instanceof Error) {
            this.logger.error(`[${correlationId}] Unhandled Exception: ${exception.message}`, exception.stack);
        }
        const payload = {
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map