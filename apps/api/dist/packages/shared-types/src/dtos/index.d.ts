import { Role, PaymentStatus, PaymentMethod, AccountType, AccountStatus, Currency, TransactionType, TransactionStatus, KycStatus, RiskLevel, FraudAlertStatus, FraudRuleCode } from '../enums';
import { IUser, ITransaction, IFraudAlert } from '../models';
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    correlationId?: string;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
        correlationId?: string;
    };
    timestamp: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface PaginationQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface LoginDto {
    email: string;
    password?: string;
    role?: Role;
}
export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
    user: IUser;
}
export interface DemoUserDto {
    id: string;
    email: string;
    name: string;
    role: Role;
    description: string;
}
export interface CreateCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    initialRiskScore?: number;
}
export interface UpdateKycStatusDto {
    kycStatus: KycStatus;
    notes?: string;
}
export interface CreateAccountDto {
    customerId: string;
    accountType: AccountType;
    currency: Currency;
    initialDeposit?: string;
}
export interface UpdateAccountStatusDto {
    status: AccountStatus;
    reason?: string;
}
export interface CreatePaymentDto {
    idempotencyKey: string;
    customerId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    amount: string;
    currency: Currency;
    paymentMethod: PaymentMethod;
    description?: string;
    metadata?: Record<string, unknown>;
}
export interface RefundPaymentDto {
    amount?: string;
    reason: string;
}
export interface CancelPaymentDto {
    reason: string;
}
export interface TransactionFilterDto extends PaginationQueryDto {
    accountId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    currency?: Currency;
    from?: string;
    to?: string;
    minAmount?: string;
    maxAmount?: string;
}
export interface PaymentFilterDto extends PaginationQueryDto {
    customerId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    currency?: Currency;
    from?: string;
    to?: string;
}
export interface FraudFilterDto extends PaginationQueryDto {
    status?: FraudAlertStatus;
    riskLevel?: RiskLevel;
    ruleCode?: FraudRuleCode;
    from?: string;
    to?: string;
}
export interface InvestigateFraudAlertDto {
    decision: FraudAlertStatus;
    notes: string;
}
export interface UpdateFraudRuleDto {
    scoreWeight?: number;
    isActive?: boolean;
    criteria?: Record<string, unknown>;
}
export interface TimeSeriesPoint {
    timestamp: string;
    volume: number;
    count: number;
    successRate: number;
}
export interface DashboardMetricsDto {
    summary: {
        totalVolume: string;
        totalTransactions: number;
        successfulPayments: number;
        failedPayments: number;
        pendingPayments: number;
        fraudAlertsCount: number;
        totalRefunds: string;
        totalChargebacks: string;
        averageRiskScore: number;
        volumeGrowthPct: number;
        txCountGrowthPct: number;
        fraudReductionPct: number;
    };
    volumeTrends: TimeSeriesPoint[];
    paymentSuccessBreakdown: {
        completed: number;
        failed: number;
        pending: number;
        refunded: number;
        chargeback: number;
    };
    paymentMethodDistribution: Array<{
        method: PaymentMethod;
        count: number;
        volume: string;
        percentage: number;
    }>;
    fraudTrends: Array<{
        date: string;
        criticalAlerts: number;
        highAlerts: number;
        mediumAlerts: number;
        resolvedCount: number;
    }>;
    topRiskRules: Array<{
        ruleCode: string;
        ruleName: string;
        triggerCount: number;
        avgScoreContribution: number;
    }>;
    geographicDistribution: Array<{
        countryCode: string;
        countryName: string;
        volume: string;
        txCount: number;
        riskScoreAvg: number;
    }>;
    recentTransactions: ITransaction[];
    liveFraudAlerts: IFraudAlert[];
}
