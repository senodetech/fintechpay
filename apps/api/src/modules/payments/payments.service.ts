import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import { FraudEngineService } from '../fraud/fraud-engine.service';
import {
  IPayment,
  IPaymentEvent,
  ITransaction,
  CreatePaymentDto,
  RefundPaymentDto,
  CancelPaymentDto,
  PaymentFilterDto,
  PaginatedResponse,
  PaymentStatus,
  PaymentProvider,
  TransactionType,
  TransactionDirection,
  TransactionStatus,
  LedgerEntryType,
  AccountStatus,
  AuditAction,
  RiskLevel,
  FraudAlertStatus,
  NotificationType,
} from '@finpay360/shared-types';
import { MoneyMath } from '../../common/utils/money-math';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly mockDb: MockDbService,
    private readonly fraudEngine: FraudEngineService,
  ) {}

  public findAll(filter: PaymentFilterDto): PaginatedResponse<IPayment> {
    let items = [...this.mockDb.payments];

    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.paymentReference.toLowerCase().includes(s) ||
          (p.customerName && p.customerName.toLowerCase().includes(s)) ||
          (p.providerReference && p.providerReference.toLowerCase().includes(s)),
      );
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

  public findById(id: string): {
    payment: IPayment;
    events: IPaymentEvent[];
    transactions: ITransaction[];
  } {
    const payment = this.mockDb.payments.find(
      (p) => p.id === id || p.paymentReference === id,
    );
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} was not found.`);
    }

    const transactions = this.mockDb.transactions.filter((t) => t.paymentId === payment.id);

    // Mock lifecycle timeline events if not present
    const events: IPaymentEvent[] = [
      {
        id: `pe-${payment.id}-1`,
        paymentId: payment.id,
        fromStatus: PaymentStatus.INITIATED,
        toStatus: PaymentStatus.AUTHORIZED,
        reason: 'Payment requested and funds verified',
        createdAt: payment.createdAt,
      },
      {
        id: `pe-${payment.id}-2`,
        paymentId: payment.id,
        fromStatus: PaymentStatus.AUTHORIZED,
        toStatus: PaymentStatus.PROCESSING,
        reason: 'Dispatched to settlement network',
        createdAt: payment.createdAt,
      },
      {
        id: `pe-${payment.id}-3`,
        paymentId: payment.id,
        fromStatus: PaymentStatus.PROCESSING,
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

  public async createPayment(dto: CreatePaymentDto, userEmail?: string): Promise<IPayment> {
    // 1. Validate Idempotency
    const existingPayment = this.mockDb.payments.find(
      (p) => p.idempotencyKey === dto.idempotencyKey,
    );
    if (existingPayment) {
      this.logger.log(`Idempotency hit for key ${dto.idempotencyKey}. Returning existing payment.`);
      return existingPayment;
    }

    // 2. Validate Source & Destination Accounts
    const sourceAccount = this.mockDb.accounts.find((a) => a.id === dto.sourceAccountId);
    const destAccount = this.mockDb.accounts.find((a) => a.id === dto.destinationAccountId);

    if (!sourceAccount) {
      throw new NotFoundException(`Source account with ID ${dto.sourceAccountId} was not found.`);
    }
    if (!destAccount) {
      throw new NotFoundException(`Destination account with ID ${dto.destinationAccountId} was not found.`);
    }

    if (sourceAccount.status === AccountStatus.FROZEN) {
      throw new BadRequestException('Source account is currently frozen. Payment cannot proceed.');
    }
    if (destAccount.status === AccountStatus.FROZEN) {
      throw new BadRequestException('Destination account is currently frozen.');
    }

    const amountStr = MoneyMath.toDbString(dto.amount);
    if (!MoneyMath.isPositive(amountStr)) {
      throw new BadRequestException('Payment amount must be strictly positive.');
    }

    // 3. Balance verification
    if (MoneyMath.isLessThan(sourceAccount.availableBalance, amountStr)) {
      throw new BadRequestException(
        `Insufficient funds. Available: $${sourceAccount.availableBalance}, Requested: $${amountStr}`,
      );
    }

    // 4. Real-time Fraud & Risk Evaluation
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
    const finalStatus = isBlocked ? PaymentStatus.FAILED : PaymentStatus.COMPLETED;

    const newPayment: IPayment = {
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
      provider: PaymentProvider.MOCK_BANK_RAIL,
      providerReference: `RAIL-${900000 + paymentSeq}`,
      riskScore: fraudEval.riskScore,
      failureReason: isBlocked ? 'Blocked by automated risk rules due to critical fraud anomaly.' : undefined,
      metadata: dto.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockDb.payments.unshift(newPayment);

    // 5. If high risk, create Fraud Alert
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
        status: FraudAlertStatus.OPEN,
        triggers: fraudEval.triggeredRules,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      this.mockDb.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: NotificationType.FRAUD_ALERT,
        title: `Fraud Alert: ${newPayment.paymentReference}`,
        message: `High risk payment ($${amountStr}) flagged with score ${fraudEval.riskScore}.`,
        severity: fraudEval.riskScore > 80 ? 'CRITICAL' : 'WARNING',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 6. If completed, execute atomic double-entry balance mutation
    if (finalStatus === PaymentStatus.COMPLETED) {
      const srcBalBefore = sourceAccount.availableBalance;
      const srcBalAfter = MoneyMath.toDbString(MoneyMath.subtract(srcBalBefore, amountStr));
      sourceAccount.availableBalance = srcBalAfter;
      sourceAccount.ledgerBalance = srcBalAfter;
      sourceAccount.version += 1;

      const destBalBefore = destAccount.availableBalance;
      const destBalAfter = MoneyMath.toDbString(MoneyMath.add(destBalBefore, amountStr));
      destAccount.availableBalance = destBalAfter;
      destAccount.ledgerBalance = destBalAfter;
      destAccount.version += 1;

      // Create Transactions
      const txSeq = this.mockDb.transactions.length + 1;
      const txDebit: ITransaction = {
        id: `tx-${String(txSeq).padStart(5, '0')}`,
        transactionReference: `TXN-DEB-${800000 + txSeq}`,
        paymentId: newPayment.id,
        accountId: sourceAccount.id,
        accountNumber: sourceAccount.maskedAccountNumber,
        type: TransactionType.TRANSFER,
        amount: amountStr,
        currency: sourceAccount.currency,
        direction: TransactionDirection.OUTBOUND,
        status: TransactionStatus.SETTLED,
        balanceBefore: srcBalBefore,
        balanceAfter: srcBalAfter,
        description: `Transfer to ${destAccount.maskedAccountNumber} - Ref ${paymentRef}`,
        createdAt: newPayment.createdAt,
      };
      this.mockDb.transactions.unshift(txDebit);

      const txCredit: ITransaction = {
        id: `tx-${String(txSeq + 1).padStart(5, '0')}`,
        transactionReference: `TXN-CRD-${800000 + txSeq + 1}`,
        paymentId: newPayment.id,
        accountId: destAccount.id,
        accountNumber: destAccount.maskedAccountNumber,
        type: TransactionType.TRANSFER,
        amount: amountStr,
        currency: destAccount.currency,
        direction: TransactionDirection.INBOUND,
        status: TransactionStatus.SETTLED,
        balanceBefore: destBalBefore,
        balanceAfter: destBalAfter,
        description: `Transfer from ${sourceAccount.maskedAccountNumber} - Ref ${paymentRef}`,
        createdAt: newPayment.createdAt,
      };
      this.mockDb.transactions.unshift(txCredit);

      // Create Double-Entry Ledger Entries
      this.mockDb.ledgerEntries.unshift({
        id: `led-${Date.now()}-1`,
        transactionId: txDebit.id,
        accountId: sourceAccount.id,
        accountNumber: sourceAccount.maskedAccountNumber,
        entryType: LedgerEntryType.DEBIT,
        amount: amountStr,
        currency: sourceAccount.currency,
        postedAt: newPayment.createdAt,
      });

      this.mockDb.ledgerEntries.unshift({
        id: `led-${Date.now()}-2`,
        transactionId: txCredit.id,
        accountId: destAccount.id,
        accountNumber: destAccount.maskedAccountNumber,
        entryType: LedgerEntryType.CREDIT,
        amount: amountStr,
        currency: destAccount.currency,
        postedAt: newPayment.createdAt,
      });

      // Notification
      this.mockDb.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Payment Processed',
        message: `Payment ${paymentRef} of $${amountStr} settled successfully.`,
        severity: 'SUCCESS',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Record Audit
    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.CREATE_PAYMENT,
      entityType: 'Payment',
      entityId: newPayment.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Payment Engine',
      result: isBlocked ? 'FAILURE' : 'SUCCESS',
      afterState: newPayment as any,
      createdAt: new Date().toISOString(),
    });

    return newPayment;
  }

  public async refundPayment(
    id: string,
    dto: RefundPaymentDto,
    userEmail?: string,
  ): Promise<IPayment> {
    const payment = this.mockDb.payments.find(
      (p) => p.id === id || p.paymentReference === id,
    );
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} was not found.`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund payment with status: ${payment.status}. Only COMPLETED payments can be refunded.`,
      );
    }

    const refundAmount = dto.amount ? MoneyMath.toDbString(dto.amount) : payment.amount;
    const sourceAccount = this.mockDb.accounts.find((a) => a.id === payment.sourceAccountId);
    const destAccount = this.mockDb.accounts.find((a) => a.id === payment.destinationAccountId);

    if (destAccount && MoneyMath.isLessThan(destAccount.availableBalance, refundAmount)) {
      throw new BadRequestException('Destination account does not have sufficient balance for reversal.');
    }

    const beforeState = { status: payment.status };
    payment.status = PaymentStatus.REFUNDED;
    payment.updatedAt = new Date().toISOString();

    // Reverse balances
    if (sourceAccount && destAccount) {
      sourceAccount.availableBalance = MoneyMath.toDbString(
        MoneyMath.add(sourceAccount.availableBalance, refundAmount),
      );
      sourceAccount.ledgerBalance = sourceAccount.availableBalance;
      sourceAccount.version += 1;

      destAccount.availableBalance = MoneyMath.toDbString(
        MoneyMath.subtract(destAccount.availableBalance, refundAmount),
      );
      destAccount.ledgerBalance = destAccount.availableBalance;
      destAccount.version += 1;

      const txSeq = this.mockDb.transactions.length + 1;
      this.mockDb.transactions.unshift({
        id: `tx-${String(txSeq).padStart(5, '0')}`,
        transactionReference: `TXN-REF-${800000 + txSeq}`,
        paymentId: payment.id,
        accountId: sourceAccount.id,
        accountNumber: sourceAccount.maskedAccountNumber,
        type: TransactionType.REFUND,
        amount: refundAmount,
        currency: sourceAccount.currency,
        direction: TransactionDirection.INBOUND,
        status: TransactionStatus.SETTLED,
        balanceBefore: sourceAccount.availableBalance,
        balanceAfter: sourceAccount.availableBalance,
        description: `Refund for ${payment.paymentReference} - Reason: ${dto.reason}`,
        createdAt: new Date().toISOString(),
      });
    }

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.REFUND_PAYMENT,
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

  public async cancelPayment(
    id: string,
    dto: CancelPaymentDto,
    userEmail?: string,
  ): Promise<IPayment> {
    const payment = this.mockDb.payments.find(
      (p) => p.id === id || p.paymentReference === id,
    );
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} was not found.`);
    }

    if (payment.status !== PaymentStatus.INITIATED && payment.status !== PaymentStatus.AUTHORIZED) {
      throw new BadRequestException(`Cannot cancel payment in ${payment.status} state.`);
    }

    payment.status = PaymentStatus.CANCELLED;
    payment.failureReason = dto.reason;
    payment.updatedAt = new Date().toISOString();

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.CANCEL_PAYMENT,
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
}
