import { Role, Permission, PaymentStatus, PaymentMethod, PaymentProvider, AccountType, AccountStatus, Currency, TransactionType, TransactionDirection, TransactionStatus, LedgerEntryType, KycStatus, RiskLevel, FraudAlertStatus, FraudRuleCode, NotificationType, AuditAction } from '../enums';
export interface IUser {
    id: string;
    externalAuthId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles: Role[];
    permissions: Permission[];
    status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ICustomer {
    id: string;
    customerNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    kycStatus: KycStatus;
    riskLevel: RiskLevel;
    riskScore: number;
    status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
    createdAt: string;
    updatedAt: string;
}
export interface IAccount {
    id: string;
    accountNumber: string;
    maskedAccountNumber: string;
    customerId: string;
    customerName?: string;
    accountType: AccountType;
    currency: Currency;
    availableBalance: string;
    ledgerBalance: string;
    status: AccountStatus;
    version: number;
    createdAt: string;
    updatedAt: string;
}
export interface IPayment {
    id: string;
    paymentReference: string;
    idempotencyKey: string;
    customerId: string;
    customerName?: string;
    sourceAccountId: string;
    sourceAccountNumber?: string;
    destinationAccountId: string;
    destinationAccountNumber?: string;
    amount: string;
    currency: Currency;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    provider: PaymentProvider;
    providerReference?: string;
    riskScore: number;
    failureReason?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
export interface IPaymentEvent {
    id: string;
    paymentId: string;
    fromStatus: PaymentStatus;
    toStatus: PaymentStatus;
    reason?: string;
    createdAt: string;
}
export interface ITransaction {
    id: string;
    transactionReference: string;
    paymentId?: string;
    accountId: string;
    accountNumber?: string;
    type: TransactionType;
    amount: string;
    currency: Currency;
    direction: TransactionDirection;
    status: TransactionStatus;
    balanceBefore: string;
    balanceAfter: string;
    description: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}
export interface ILedgerEntry {
    id: string;
    transactionId: string;
    accountId: string;
    accountNumber?: string;
    entryType: LedgerEntryType;
    amount: string;
    currency: Currency;
    postedAt: string;
}
export interface IFraudRule {
    id: string;
    ruleCode: FraudRuleCode;
    name: string;
    description: string;
    criteria: Record<string, unknown>;
    scoreWeight: number;
    isActive: boolean;
    createdAt: string;
}
export interface IFraudAlert {
    id: string;
    alertReference: string;
    paymentId: string;
    paymentReference?: string;
    customerId: string;
    customerName?: string;
    amount: string;
    currency: Currency;
    ruleId?: string;
    ruleName?: string;
    riskScore: number;
    riskLevel: RiskLevel;
    status: FraudAlertStatus;
    triggers: Array<{
        ruleCode: string;
        ruleName: string;
        score: number;
        details: string;
    }>;
    createdAt: string;
    updatedAt: string;
}
export interface IFraudInvestigation {
    id: string;
    alertId: string;
    analystId: string;
    analystName: string;
    notes: string;
    decision: FraudAlertStatus;
    createdAt: string;
}
export interface INotification {
    id: string;
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: string;
}
export interface IAuditLog {
    id: string;
    userId?: string;
    userEmail?: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    ipAddress: string;
    userAgent: string;
    result: 'SUCCESS' | 'FAILURE';
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map