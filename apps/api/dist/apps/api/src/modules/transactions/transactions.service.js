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
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
const money_math_1 = require("../../common/utils/money-math");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    mockDb;
    logger = new common_1.Logger(TransactionsService_1.name);
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    findAll(filter) {
        let items = [...this.mockDb.transactions];
        if (filter.search) {
            const s = filter.search.toLowerCase();
            items = items.filter((t) => t.transactionReference.toLowerCase().includes(s) ||
                t.description.toLowerCase().includes(s) ||
                (t.accountNumber && t.accountNumber.includes(s)));
        }
        if (filter.accountId) {
            items = items.filter((t) => t.accountId === filter.accountId);
        }
        if (filter.type) {
            items = items.filter((t) => t.type === filter.type);
        }
        if (filter.status) {
            items = items.filter((t) => t.status === filter.status);
        }
        if (filter.currency) {
            items = items.filter((t) => t.currency === filter.currency);
        }
        if (filter.from) {
            const fromTime = new Date(filter.from).getTime();
            items = items.filter((t) => new Date(t.createdAt).getTime() >= fromTime);
        }
        if (filter.to) {
            const toTime = new Date(filter.to).getTime();
            items = items.filter((t) => new Date(t.createdAt).getTime() <= toTime);
        }
        if (filter.minAmount) {
            items = items.filter((t) => money_math_1.MoneyMath.isGreaterThanOrEqualTo(t.amount, filter.minAmount));
        }
        if (filter.maxAmount) {
            items = items.filter((t) => money_math_1.MoneyMath.isLessThanOrEqualTo(t.amount, filter.maxAmount));
        }
        const sortField = filter.sortBy || 'createdAt';
        const sortOrder = filter.sortOrder || 'desc';
        items.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (sortField === 'createdAt') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }
            if (valA < valB)
                return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB)
                return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        const page = Number(filter.page) || 1;
        const limit = Number(filter.limit) || 15;
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
    findById(id) {
        const transaction = this.mockDb.transactions.find((t) => t.id === id || t.transactionReference === id);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} was not found.`);
        }
        const ledgerEntries = this.mockDb.ledgerEntries.filter((l) => l.transactionId === transaction.id);
        return {
            transaction,
            ledgerEntries,
        };
    }
    getLedgerEntries(transactionId) {
        return this.mockDb.ledgerEntries.filter((l) => l.transactionId === transactionId);
    }
    exportCsv(filter) {
        const paginated = this.findAll({ ...filter, limit: 10000, page: 1 });
        const headers = [
            'Transaction Reference',
            'Account Number',
            'Type',
            'Amount',
            'Currency',
            'Direction',
            'Status',
            'Balance Before',
            'Balance After',
            'Description',
            'Created At',
        ];
        const rows = paginated.items.map((t) => [
            `"${t.transactionReference}"`,
            `"${t.accountNumber || ''}"`,
            `"${t.type}"`,
            `"${t.amount}"`,
            `"${t.currency}"`,
            `"${t.direction}"`,
            `"${t.status}"`,
            `"${t.balanceBefore}"`,
            `"${t.balanceAfter}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            `"${t.createdAt}"`,
        ]);
        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map