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
var AccountsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
const shared_types_1 = require("@finpay360/shared-types");
const money_math_1 = require("../../common/utils/money-math");
const mask_utils_1 = require("../../common/utils/mask-utils");
let AccountsService = AccountsService_1 = class AccountsService {
    mockDb;
    logger = new common_1.Logger(AccountsService_1.name);
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    findAll(query) {
        let items = [...this.mockDb.accounts];
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((a) => a.accountNumber.includes(s) ||
                (a.customerName && a.customerName.toLowerCase().includes(s)));
        }
        if (query.customerId) {
            items = items.filter((a) => a.customerId === query.customerId);
        }
        if (query.currency) {
            items = items.filter((a) => a.currency === query.currency);
        }
        if (query.accountType) {
            items = items.filter((a) => a.accountType === query.accountType);
        }
        if (query.status) {
            items = items.filter((a) => a.status === query.status);
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
        const account = this.mockDb.accounts.find((a) => a.id === id || a.accountNumber === id);
        if (!account) {
            throw new common_1.NotFoundException(`Account with ID ${id} was not found.`);
        }
        return account;
    }
    findTransactions(id, query) {
        const account = this.findById(id);
        const txs = this.mockDb.transactions.filter((t) => t.accountId === account.id);
        txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const total = txs.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        return {
            items: txs.slice(startIndex, startIndex + limit),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }
    create(dto, userEmail) {
        const customer = this.mockDb.customers.find((c) => c.id === dto.customerId);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${dto.customerId} was not found.`);
        }
        const seq = this.mockDb.accounts.length + 1;
        const rawAccNum = `4000${String(100000000000 + seq * 8371).slice(-12)}`;
        const initialDeposit = dto.initialDeposit ? money_math_1.MoneyMath.toDbString(dto.initialDeposit) : '0.0000';
        const newAccount = {
            id: `acc-${String(seq).padStart(3, '0')}`,
            accountNumber: rawAccNum,
            maskedAccountNumber: mask_utils_1.MaskUtils.maskAccountNumber(rawAccNum),
            customerId: customer.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            accountType: dto.accountType,
            currency: dto.currency,
            availableBalance: initialDeposit,
            ledgerBalance: initialDeposit,
            status: shared_types_1.AccountStatus.ACTIVE,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.mockDb.accounts.unshift(newAccount);
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.CREATE_PAYMENT,
            entityType: 'Account',
            entityId: newAccount.id,
            ipAddress: '127.0.0.1',
            userAgent: 'API Client',
            result: 'SUCCESS',
            afterState: newAccount,
            createdAt: new Date().toISOString(),
        });
        return newAccount;
    }
    updateStatus(id, dto, userEmail) {
        const account = this.findById(id);
        const beforeState = { status: account.status };
        account.status = dto.status;
        account.updatedAt = new Date().toISOString();
        const action = dto.status === shared_types_1.AccountStatus.FROZEN ? shared_types_1.AuditAction.FREEZE_ACCOUNT : shared_types_1.AuditAction.UNFREEZE_ACCOUNT;
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action,
            entityType: 'Account',
            entityId: account.id,
            ipAddress: '127.0.0.1',
            userAgent: 'API Client',
            result: 'SUCCESS',
            beforeState,
            afterState: { status: account.status, reason: dto.reason },
            createdAt: new Date().toISOString(),
        });
        return account;
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = AccountsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map