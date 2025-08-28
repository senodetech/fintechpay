"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
let AuditService = AuditService_1 = class AuditService {
    mockDb;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    findAll(query) {
        let items = [...this.mockDb.auditLogs];
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((a) => a.action.toLowerCase().includes(s) ||
                (a.userEmail && a.userEmail.toLowerCase().includes(s)) ||
                a.entityType.toLowerCase().includes(s) ||
                a.entityId.toLowerCase().includes(s));
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
    record(log) {
        const entry = {
            ...log,
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
        };
        this.mockDb.auditLogs.unshift(entry);
        return entry;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], AuditService);
//# sourceMappingURL=audit.service.js.map