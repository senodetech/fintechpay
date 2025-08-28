import { Injectable, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import { IAuditLog, PaginationQueryDto, PaginatedResponse, AuditAction } from '@finpay360/shared-types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly mockDb: MockDbService) {}

  public findAll(
    query: PaginationQueryDto & { action?: AuditAction; entityType?: string; userEmail?: string },
  ): PaginatedResponse<IAuditLog> {
    let items = [...this.mockDb.auditLogs];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.action.toLowerCase().includes(s) ||
          (a.userEmail && a.userEmail.toLowerCase().includes(s)) ||
          a.entityType.toLowerCase().includes(s) ||
          a.entityId.toLowerCase().includes(s),
      );
    }

    if (query.action) {
      items = items.filter((a) => a.action === query.action);
    }

    if (query.entityType) {
      items = items.filter((a) => a.entityType === query.entityType);
    }

    if (query.userEmail) {
      items = items.filter((a) => a.userEmail === query.userEmail);
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      items: items.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  public record(log: Omit<IAuditLog, 'id' | 'createdAt'>): IAuditLog {
    const entry: IAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.mockDb.auditLogs.unshift(entry);
    return entry;
  }
}
