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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
const shared_types_1 = require("@finpay360/shared-types");
let CustomersService = CustomersService_1 = class CustomersService {
    mockDb;
    logger = new common_1.Logger(CustomersService_1.name);
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    findAll(query) {
        let items = [...this.mockDb.customers];
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((c) => c.firstName.toLowerCase().includes(s) ||
                c.lastName.toLowerCase().includes(s) ||
                c.email.toLowerCase().includes(s) ||
                c.customerNumber.toLowerCase().includes(s));
        }
        if (query.kycStatus) {
            items = items.filter((c) => c.kycStatus === query.kycStatus);
        }
        if (query.riskLevel) {
            items = items.filter((c) => c.riskLevel === query.riskLevel);
        }
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const total = items.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);
        return {
            items: paginatedItems,
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }
    findById(id) {
        const customer = this.mockDb.customers.find((c) => c.id === id || c.customerNumber === id);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} was not found.`);
        }
        const accounts = this.mockDb.accounts.filter((a) => a.customerId === customer.id);
        const payments = this.mockDb.payments.filter((p) => p.customerId === customer.id);
        const fraudAlerts = this.mockDb.fraudAlerts.filter((a) => a.customerId === customer.id);
        const accountIds = new Set(accounts.map((a) => a.id));
        const transactions = this.mockDb.transactions.filter((t) => accountIds.has(t.accountId));
        return {
            customer,
            accounts,
            payments: payments.slice(0, 10),
            transactions: transactions.slice(0, 15),
            fraudAlerts,
        };
    }
    create(dto, userEmail) {
        const customerNumber = `CUST-${100000 + this.mockDb.customers.length + 1}`;
        const riskScore = dto.initialRiskScore || 20;
        let riskLevel = shared_types_1.RiskLevel.LOW;
        if (riskScore > 80)
            riskLevel = shared_types_1.RiskLevel.CRITICAL;
        else if (riskScore > 60)
            riskLevel = shared_types_1.RiskLevel.HIGH;
        else if (riskScore > 30)
            riskLevel = shared_types_1.RiskLevel.MEDIUM;
        const newCustomer = {
            id: `cust-${String(this.mockDb.customers.length + 1).padStart(3, '0')}`,
            customerNumber,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            country: dto.country,
            kycStatus: shared_types_1.KycStatus.PENDING,
            riskLevel,
            riskScore,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.mockDb.customers.unshift(newCustomer);
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.UPDATE_KYC,
            entityType: 'Customer',
            entityId: newCustomer.id,
            ipAddress: '127.0.0.1',
            userAgent: 'API Client',
            result: 'SUCCESS',
            afterState: newCustomer,
            createdAt: new Date().toISOString(),
        });
        return newCustomer;
    }
    updateKyc(id, dto, userEmail) {
        const customer = this.mockDb.customers.find((c) => c.id === id || c.customerNumber === id);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} was not found.`);
        }
        const beforeState = { kycStatus: customer.kycStatus };
        customer.kycStatus = dto.kycStatus;
        customer.updatedAt = new Date().toISOString();
        if (dto.kycStatus === shared_types_1.KycStatus.REJECTED) {
            customer.riskLevel = shared_types_1.RiskLevel.CRITICAL;
            customer.riskScore = Math.max(customer.riskScore, 85);
        }
        else if (dto.kycStatus === shared_types_1.KycStatus.VERIFIED) {
            customer.riskScore = Math.max(10, customer.riskScore - 15);
        }
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.UPDATE_KYC,
            entityType: 'Customer',
            entityId: customer.id,
            ipAddress: '127.0.0.1',
            userAgent: 'API Client',
            result: 'SUCCESS',
            beforeState,
            afterState: { kycStatus: customer.kycStatus, notes: dto.notes },
            createdAt: new Date().toISOString(),
        });
        return customer;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map