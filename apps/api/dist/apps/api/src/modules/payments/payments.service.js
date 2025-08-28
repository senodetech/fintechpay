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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
const fraud_engine_service_1 = require("../fraud/fraud-engine.service");
const shared_types_1 = require("@finpay360/shared-types");
const money_math_1 = require("../../common/utils/money-math");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    mockDb;
    fraudEngine;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(mockDb, fraudEngine) {
        this.mockDb = mockDb;
        this.fraudEngine = fraudEngine;
    }
    findAll(filter) {
        let items = [...this.mockDb.payments];
        if (filter.search) {
            const s = filter.search.toLowerCase();
            items = items.filter((p) => p.paymentReference.toLowerCase().includes(s) ||
                (p.customerName && p.customerName.toLowerCase().includes(s)) ||
                (p.providerReference && p.providerReference.toLowerCase().includes(s)));
        }
        if (filter.customerId) {
            items = items.filter((p) => p.customerId === filter.customerId);
        }
        if (filter.status) {
            items = items.filter((p) => p.status === filter.status);
        }
        if (filter.paymentMethod) {
            items = items.filter((p) => p.paymentMethod === filter.paymentMethod);
        }
        if (filter.currency) {
            items = items.filter((p) => p.currency === filter.currency);
        }
        if (filter.from) {
            const fromTime = new Date(filter.from).getTime();
            items = items.filter((p) => new Date(p.createdAt).getTime() >= fromTime);
        }
        if (filter.to) {
            const toTime = new Date(filter.to).getTime();
            items = items.filter((p) => new Date(p.createdAt).getTime() <= toTime);
        }
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const page = Number(filter.page) || 1;
        const limit = Number(filter.limit) || 10;
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
        const payment = this.mockDb.payments.find((p) => p.id === id || p.paymentReference === id);
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} was not found.`);
        }
        const transactions = this.mockDb.transactions.filter((t) => t.paymentId === payment.id);
        const events = [
            {
                id: `pe-${payment.id}-1`,
                paymentId: payment.id,
                fromStatus: shared_types_1.PaymentStatus.INITIATED,
                toStatus: shared_types_1.PaymentStatus.AUTHORIZED,
                reason: 'Payment requested and funds verified',
                createdAt: payment.createdAt,
            },
            {
                id: `pe-${payment.id}-2`,
                paymentId: payment.id,
                fromStatus: shared_types_1.PaymentStatus.AUTHORIZED,
                toStatus: shared_types_1.PaymentStatus.PROCESSING,
                reason: 'Dispatched to settlement network',
                createdAt: payment.createdAt,
            },
            {
                id: `pe-${payment.id}-3`,
                paymentId: payment.id,
                fromStatus: shared_types_1.PaymentStatus.PROCESSING,
                toStatus: payment.status,
                reason: payment.failureReason || 'Settlement confirmed',
                createdAt: payment.updatedAt,
            },
        ];
        return {
            payment,
            events,
            transactions,
        };
    }
    async createPayment(dto, userEmail) {
        const existingPayment = this.mockDb.payments.find((p) => p.idempotencyKey === dto.idempotencyKey);
        if (existingPayment) {
            this.logger.log(`Idempotency hit for key ${dto.idempotencyKey}. Returning existing payment.`);
            return existingPayment;
        }
        const sourceAccount = this.mockDb.accounts.find((a) => a.id === dto.sourceAccountId);
        const destAccount = this.mockDb.accounts.find((a) => a.id === dto.destinationAccountId);
        if (!sourceAccount) {
            throw new common_1.NotFoundException(`Source account with ID ${dto.sourceAccountId} was not found.`);
        }
        if (!destAccount) {
            throw new common_1.NotFoundException(`Destination account with ID ${dto.destinationAccountId} was not found.`);
        }
        if (sourceAccount.status === shared_types_1.AccountStatus.FROZEN) {
            throw new common_1.BadRequestException('Source account is currently frozen. Payment cannot proceed.');
        }
        if (destAccount.status === shared_types_1.AccountStatus.FROZEN) {
            throw new common_1.BadRequestException('Destination account is currently frozen.');
        }
        const amountStr = money_math_1.MoneyMath.toDbString(dto.amount);
        if (!money_math_1.MoneyMath.isPositive(amountStr)) {
            throw new common_1.BadRequestException('Payment amount must be strictly positive.');
        }
        if (money_math_1.MoneyMath.isLessThan(sourceAccount.availableBalance, amountStr)) {
            throw new common_1.BadRequestException(`Insufficient funds. Available: $${sourceAccount.availableBalance}, Requested: $${amountStr}`);
        }
        const fraudEval = this.fraudEngine.evaluatePayment({
            customerId: dto.customerId,
            sourceAccountId: dto.sourceAccountId,
            amount: amountStr,
            currency: dto.currency,
            paymentMethod: dto.paymentMethod,
            metadata: dto.metadata,
        });
        const paymentSeq = this.mockDb.payments.length + 1;
        const paymentRef = `PAY-${800000 + paymentSeq}`;
        const customer = this.mockDb.customers.find((c) => c.id === dto.customerId);
        const isBlocked = fraudEval.decision === 'BLOCK';
        const finalStatus = isBlocked ? shared_types_1.PaymentStatus.FAILED : shared_types_1.PaymentStatus.COMPLETED;
        const newPayment = {
            id: `pay-${String(paymentSeq).padStart(4, '0')}`,
            paymentReference: paymentRef,
            idempotencyKey: dto.idempotencyKey,
            customerId: dto.customerId,
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Client',
            sourceAccountId: sourceAccount.id,
            sourceAccountNumber: sourceAccount.maskedAccountNumber,
            destinationAccountId: destAccount.id,
            destinationAccountNumber: destAccount.maskedAccountNumber,
            amount: amountStr,
            currency: dto.currency,
            paymentMethod: dto.paymentMethod,
            status: finalStatus,
            provider: shared_types_1.PaymentProvider.MOCK_BANK_RAIL,
            providerReference: `RAIL-${900000 + paymentSeq}`,
            riskScore: fraudEval.riskScore,
            failureReason: isBlocked ? 'Blocked by automated risk rules due to critical fraud anomaly.' : undefined,
            metadata: dto.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.mockDb.payments.unshift(newPayment);
        if (fraudEval.riskScore >= 60 || isBlocked) {
            const alertSeq = this.mockDb.fraudAlerts.length + 1;
            this.mockDb.fraudAlerts.unshift({
                id: `alert-${String(alertSeq).padStart(3, '0')}`,
                alertReference: `ALT-${90000 + alertSeq}`,
                paymentId: newPayment.id,
                paymentReference: newPayment.paymentReference,
                customerId: newPayment.customerId,
                customerName: newPayment.customerName,
                amount: newPayment.amount,
                currency: newPayment.currency,
                riskScore: fraudEval.riskScore,
                riskLevel: fraudEval.riskLevel,
                status: shared_types_1.FraudAlertStatus.OPEN,
                triggers: fraudEval.triggeredRules,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            this.mockDb.notifications.unshift({
                id: `notif-${Date.now()}`,
                type: shared_types_1.NotificationType.FRAUD_ALERT,
                title: `Fraud Alert: ${newPayment.paymentReference}`,
                message: `High risk payment ($${amountStr}) flagged with score ${fraudEval.riskScore}.`,
                severity: fraudEval.riskScore > 80 ? 'CRITICAL' : 'WARNING',
                isRead: false,
                createdAt: new Date().toISOString(),
            });
        }
        if (finalStatus === shared_types_1.PaymentStatus.COMPLETED) {
            const srcBalBefore = sourceAccount.availableBalance;
            const srcBalAfter = money_math_1.MoneyMath.toDbString(money_math_1.MoneyMath.subtract(srcBalBefore, amountStr));
            sourceAccount.availableBalance = srcBalAfter;
            sourceAccount.ledgerBalance = srcBalAfter;
            sourceAccount.version += 1;
            const destBalBefore = destAccount.availableBalance;
            const destBalAfter = money_math_1.MoneyMath.toDbString(money_math_1.MoneyMath.add(destBalBefore, amountStr));
            destAccount.availableBalance = destBalAfter;
            destAccount.ledgerBalance = destBalAfter;
            destAccount.version += 1;
            const txSeq = this.mockDb.transactions.length + 1;
            const txDebit = {
                id: `tx-${String(txSeq).padStart(5, '0')}`,
                transactionReference: `TXN-DEB-${800000 + txSeq}`,
                paymentId: newPayment.id,
                accountId: sourceAccount.id,
                accountNumber: sourceAccount.maskedAccountNumber,
                type: shared_types_1.TransactionType.TRANSFER,
                amount: amountStr,
                currency: sourceAccount.currency,
                direction: shared_types_1.TransactionDirection.OUTBOUND,
                status: shared_types_1.TransactionStatus.SETTLED,
                balanceBefore: srcBalBefore,
                balanceAfter: srcBalAfter,
                description: `Transfer to ${destAccount.maskedAccountNumber} - Ref ${paymentRef}`,
                createdAt: newPayment.createdAt,
            };
            this.mockDb.transactions.unshift(txDebit);
            const txCredit = {
                id: `tx-${String(txSeq + 1).padStart(5, '0')}`,
                transactionReference: `TXN-CRD-${800000 + txSeq + 1}`,
                paymentId: newPayment.id,
                accountId: destAccount.id,
                accountNumber: destAccount.maskedAccountNumber,
                type: shared_types_1.TransactionType.TRANSFER,
                amount: amountStr,
                currency: destAccount.currency,
                direction: shared_types_1.TransactionDirection.INBOUND,
                status: shared_types_1.TransactionStatus.SETTLED,
                balanceBefore: destBalBefore,
                balanceAfter: destBalAfter,
                description: `Transfer from ${sourceAccount.maskedAccountNumber} - Ref ${paymentRef}`,
                createdAt: newPayment.createdAt,
            };
            this.mockDb.transactions.unshift(txCredit);
            this.mockDb.ledgerEntries.unshift({
                id: `led-${Date.now()}-1`,
                transactionId: txDebit.id,
                accountId: sourceAccount.id,
                accountNumber: sourceAccount.maskedAccountNumber,
                entryType: shared_types_1.LedgerEntryType.DEBIT,
                amount: amountStr,
                currency: sourceAccount.currency,
                postedAt: newPayment.createdAt,
            });
            this.mockDb.ledgerEntries.unshift({
                id: `led-${Date.now()}-2`,
                transactionId: txCredit.id,
                accountId: destAccount.id,
                accountNumber: destAccount.maskedAccountNumber,
                entryType: shared_types_1.LedgerEntryType.CREDIT,
                amount: amountStr,
                currency: destAccount.currency,
                postedAt: newPayment.createdAt,
            });
            this.mockDb.notifications.unshift({
                id: `notif-${Date.now()}`,
                type: shared_types_1.NotificationType.PAYMENT_SUCCESS,
                title: 'Payment Processed',
                message: `Payment ${paymentRef} of $${amountStr} settled successfully.`,
                severity: 'SUCCESS',
                isRead: false,
                createdAt: new Date().toISOString(),
            });
        }
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.CREATE_PAYMENT,
            entityType: 'Payment',
            entityId: newPayment.id,
            ipAddress: '127.0.0.1',
            userAgent: 'Payment Engine',
            result: isBlocked ? 'FAILURE' : 'SUCCESS',
            afterState: newPayment,
            createdAt: new Date().toISOString(),
        });
        return newPayment;
    }
    async refundPayment(id, dto, userEmail) {
        const payment = this.mockDb.payments.find((p) => p.id === id || p.paymentReference === id);
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} was not found.`);
        }
        if (payment.status !== shared_types_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException(`Cannot refund payment with status: ${payment.status}. Only COMPLETED payments can be refunded.`);
        }
        const refundAmount = dto.amount ? money_math_1.MoneyMath.toDbString(dto.amount) : payment.amount;
        const sourceAccount = this.mockDb.accounts.find((a) => a.id === payment.sourceAccountId);
        const destAccount = this.mockDb.accounts.find((a) => a.id === payment.destinationAccountId);
        if (destAccount && money_math_1.MoneyMath.isLessThan(destAccount.availableBalance, refundAmount)) {
            throw new common_1.BadRequestException('Destination account does not have sufficient balance for reversal.');
        }
        const beforeState = { status: payment.status };
        payment.status = shared_types_1.PaymentStatus.REFUNDED;
        payment.updatedAt = new Date().toISOString();
        if (sourceAccount && destAccount) {
            sourceAccount.availableBalance = money_math_1.MoneyMath.toDbString(money_math_1.MoneyMath.add(sourceAccount.availableBalance, refundAmount));
            sourceAccount.ledgerBalance = sourceAccount.availableBalance;
            sourceAccount.version += 1;
            destAccount.availableBalance = money_math_1.MoneyMath.toDbString(money_math_1.MoneyMath.subtract(destAccount.availableBalance, refundAmount));
            destAccount.ledgerBalance = destAccount.availableBalance;
            destAccount.version += 1;
            const txSeq = this.mockDb.transactions.length + 1;
            this.mockDb.transactions.unshift({
                id: `tx-${String(txSeq).padStart(5, '0')}`,
                transactionReference: `TXN-REF-${800000 + txSeq}`,
                paymentId: payment.id,
                accountId: sourceAccount.id,
                accountNumber: sourceAccount.maskedAccountNumber,
                type: shared_types_1.TransactionType.REFUND,
                amount: refundAmount,
                currency: sourceAccount.currency,
                direction: shared_types_1.TransactionDirection.INBOUND,
                status: shared_types_1.TransactionStatus.SETTLED,
                balanceBefore: sourceAccount.availableBalance,
                balanceAfter: sourceAccount.availableBalance,
                description: `Refund for ${payment.paymentReference} - Reason: ${dto.reason}`,
                createdAt: new Date().toISOString(),
            });
        }
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.REFUND_PAYMENT,
            entityType: 'Payment',
            entityId: payment.id,
            ipAddress: '127.0.0.1',
            userAgent: 'Payment Reversal Engine',
            result: 'SUCCESS',
            beforeState,
            afterState: { status: payment.status, reason: dto.reason, refundAmount },
            createdAt: new Date().toISOString(),
        });
        return payment;
    }
    async cancelPayment(id, dto, userEmail) {
        const payment = this.mockDb.payments.find((p) => p.id === id || p.paymentReference === id);
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} was not found.`);
        }
        if (payment.status !== shared_types_1.PaymentStatus.INITIATED && payment.status !== shared_types_1.PaymentStatus.AUTHORIZED) {
            throw new common_1.BadRequestException(`Cannot cancel payment in ${payment.status} state.`);
        }
        payment.status = shared_types_1.PaymentStatus.CANCELLED;
        payment.failureReason = dto.reason;
        payment.updatedAt = new Date().toISOString();
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.CANCEL_PAYMENT,
            entityType: 'Payment',
            entityId: payment.id,
            ipAddress: '127.0.0.1',
            userAgent: 'Payment Cancellation Engine',
            result: 'SUCCESS',
            afterState: { status: payment.status, reason: dto.reason },
            createdAt: new Date().toISOString(),
        });
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService,
        fraud_engine_service_1.FraudEngineService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map