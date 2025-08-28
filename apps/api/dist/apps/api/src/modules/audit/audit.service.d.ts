import { MockDbService } from '../../database/mock-db.service';
import { IAuditLog, PaginationQueryDto, PaginatedResponse, AuditAction } from "@finpay360/shared-types";
export declare class AuditService {
    private readonly mockDb;
    private readonly logger;
    constructor(mockDb: MockDbService);
    findAll(query: PaginationQueryDto & {
        action?: AuditAction;
        entityType?: string;
        userEmail?: string;
    }): PaginatedResponse<IAuditLog>;
    record(log: Omit<IAuditLog, 'id' | 'createdAt'>): IAuditLog;
}
