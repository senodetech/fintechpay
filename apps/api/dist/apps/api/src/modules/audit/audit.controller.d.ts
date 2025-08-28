import { AuditService } from './audit.service';
import { PaginationQueryDto, AuditAction } from "@finpay360/shared-types";
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: PaginationQueryDto & {
        action?: AuditAction;
        entityType?: string;
        userEmail?: string;
    }): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").IAuditLog>;
}
