import { PaymentStatus, TransactionType, RiskLevel, FraudAlertStatus, Currency } from '../enums';

export interface BaseDomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: string;
  correlationId?: string;
  payload: T;
}

export interface PaymentCreatedEventPayload {
  paymentId: string;
  paymentReference: string;
  customerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: string;
  currency: Currency;
  status: PaymentStatus;
}

export interface PaymentCompletedEventPayload {
  paymentId: string;
  paymentReference: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: string;
  currency: Currency;
  settledAt: string;
}

export interface TransactionCreatedEventPayload {
  transactionId: string;
  transactionReference: string;
  accountId: string;
  paymentId?: string;
  type: TransactionType;
  amount: string;
  currency: Currency;
  balanceAfter: string;
  createdAt: string;
}

export interface FraudAlertCreatedEventPayload {
  alertId: string;
  alertReference: string;
  paymentId: string;
  customerId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: FraudAlertStatus;
  triggeredRules: string[];
}

export interface AccountBalanceUpdatedEventPayload {
  accountId: string;
  accountNumber: string;
  currency: Currency;
  previousBalance: string;
  newAvailableBalance: string;
  newLedgerBalance: string;
  version: number;
  updatedAt: string;
}

export interface NotificationCreatedEventPayload {
  notificationId: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
}
