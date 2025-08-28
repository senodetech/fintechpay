import { Injectable, Logger } from '@nestjs/common';
import {
  Role,
  Permission,
  PaymentStatus,
  PaymentMethod,
  PaymentProvider,
  AccountType,
  AccountStatus,
  Currency,
  TransactionType,
  TransactionDirection,
  TransactionStatus,
  LedgerEntryType,
  KycStatus,
  RiskLevel,
  FraudAlertStatus,
  FraudRuleCode,
  NotificationType,
  AuditAction,
  IUser,
  ICustomer,
  IAccount,
  IPayment,
  ITransaction,
  ILedgerEntry,
  IFraudRule,
  IFraudAlert,
  INotification,
  IAuditLog,
} from '@finpay360/shared-types';
import { MoneyMath } from '../common/utils/money-math';
import { MaskUtils } from '../common/utils/mask-utils';

@Injectable()
export class MockDbService {
  private readonly logger = new Logger(MockDbService.name);

  public users: IUser[] = [];
  public customers: ICustomer[] = [];
  public accounts: IAccount[] = [];
  public payments: IPayment[] = [];
  public transactions: ITransaction[] = [];
  public ledgerEntries: ILedgerEntry[] = [];
  public fraudRules: IFraudRule[] = [];
  public fraudAlerts: IFraudAlert[] = [];
  public notifications: INotification[] = [];
  public auditLogs: IAuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData(): void {
    this.logger.log('Seeding enterprise FinTech dataset (100+ customers, 150+ accounts, 1000+ txs, 50+ alerts)...');

    // 1. Seed Demo Users with RBAC roles & permissions
    this.users = [
      {
        id: 'usr-admin-001',
        externalAuthId: 'auth0|admin-001',
        email: 'admin@finpay360.io',
        firstName: 'Alexander',
        lastName: 'Vance',
        roles: [Role.ADMIN],
        permissions: Object.values(Permission),
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-08-28T09:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-ops-002',
        externalAuthId: 'auth0|ops-002',
        email: 'ops@finpay360.io',
        firstName: 'Elena',
        lastName: 'Rostova',
        roles: [Role.OPERATIONS],
        permissions: [
          Permission.USERS_READ,
          Permission.ACCOUNTS_READ,
          Permission.ACCOUNTS_WRITE,
          Permission.PAYMENTS_READ,
          Permission.PAYMENTS_WRITE,
          Permission.PAYMENTS_REFUND,
          Permission.TRANSACTIONS_READ,
          Permission.TRANSACTIONS_EXPORT,
          Permission.FRAUD_READ,
          Permission.REPORTS_READ,
        ],
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-08-28T09:15:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-fin-003',
        externalAuthId: 'auth0|fin-003',
        email: 'finance@finpay360.io',
        firstName: 'Marcus',
        lastName: 'Sterling',
        roles: [Role.FINANCE],
        permissions: [
          Permission.PAYMENTS_READ,
          Permission.PAYMENTS_WRITE,
          Permission.PAYMENTS_REFUND,
          Permission.TRANSACTIONS_READ,
          Permission.TRANSACTIONS_EXPORT,
          Permission.REPORTS_READ,
        ],
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-08-28T09:30:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-risk-004',
        externalAuthId: 'auth0|risk-004',
        email: 'risk@finpay360.io',
        firstName: 'Sophia',
        lastName: 'Chen',
        roles: [Role.RISK_ANALYST],
        permissions: [
          Permission.FRAUD_READ,
          Permission.FRAUD_WRITE,
          Permission.TRANSACTIONS_READ,
          Permission.TRANSACTIONS_EXPORT,
          Permission.PAYMENTS_READ,
          Permission.REPORTS_READ,
        ],
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-08-28T09:45:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-support-005',
        externalAuthId: 'auth0|support-005',
        email: 'support@finpay360.io',
        firstName: 'David',
        lastName: 'Miller',
        roles: [Role.CUSTOMER_SUPPORT],
        permissions: [
          Permission.ACCOUNTS_READ,
          Permission.ACCOUNTS_WRITE,
          Permission.PAYMENTS_READ,
          Permission.TRANSACTIONS_READ,
        ],
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-08-28T10:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-auditor-006',
        externalAuthId: 'auth0|auditor-006',
        email: 'auditor@finpay360.io',
        firstName: 'Rachel',
        lastName: 'Kim',
        roles: [Role.AUDITOR],
        permissions: [
          Permission.USERS_READ,
          Permission.ACCOUNTS_READ,
          Permission.PAYMENTS_READ,
          Permission.TRANSACTIONS_READ,
          Permission.TRANSACTIONS_EXPORT,
          Permission.FRAUD_READ,
          Permission.REPORTS_READ,
          Permission.AUDIT_READ,
        ],
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-08-28T10:15:00Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    // 2. Seed Fraud Rules
    this.fraudRules = [
      {
        id: 'rule-01',
        ruleCode: FraudRuleCode.RULE_HIGH_VALUE,
        name: 'High Value Transaction Anomaly',
        description: 'Flags transactions exceeding $50,000 or 5x the customer 30-day baseline average.',
        criteria: { thresholdAmount: 50000, velocityMultiplier: 5 },
        scoreWeight: 35,
        isActive: true,
        createdAt: '2025-08-28T08:00:00Z',
      },
      {
        id: 'rule-02',
        ruleCode: FraudRuleCode.RULE_VELOCITY,
        name: 'Rapid Velocity Spikes',
        description: 'Triggers when more than 5 transactions are executed in a 10-minute sliding window.',
        criteria: { maxTransactions: 5, timeWindowMinutes: 10 },
        scoreWeight: 25,
        isActive: true,
        createdAt: '2025-08-28T08:00:00Z',
      },
      {
        id: 'rule-03',
        ruleCode: FraudRuleCode.RULE_GEO_ANOMALY,
        name: 'Geographic Impossibility / Velocity',
        description: 'Flags transactions occurring across two distinct countries within impossible flight time.',
        criteria: { maxSpeedKmh: 850 },
        scoreWeight: 40,
        isActive: true,
        createdAt: '2025-08-28T08:00:00Z',
      },
      {
        id: 'rule-04',
        ruleCode: FraudRuleCode.RULE_HIGH_RISK_COUNTRY,
        name: 'FATF High-Risk Jurisdiction Check',
        description: 'Elevates risk score when transaction originates or terminates in FATF watchlist countries.',
        criteria: { highRiskCountries: ['KP', 'IR', 'MM', 'SY'] },
        scoreWeight: 45,
        isActive: true,
        createdAt: '2025-08-28T08:00:00Z',
      },
      {
        id: 'rule-05',
        ruleCode: FraudRuleCode.RULE_DEVICE_ANOMALY,
        name: 'Unrecognized Device Fingerprint',
        description: 'Flags transactions initiated from a new device/browser with high-value transfer.',
        criteria: { require2FA: true },
        scoreWeight: 20,
        isActive: true,
        createdAt: '2025-08-28T08:00:00Z',
      },
      {
        id: 'rule-06',
        ruleCode: FraudRuleCode.RULE_AUTH_FAILURE,
        name: 'Repeated Authentication Failures',
        description: 'Triggers when 3 or more 2FA/Password failures occur prior to payment initiation.',
        criteria: { failureThreshold: 3, windowHours: 1 },
        scoreWeight: 30,
        isActive: true,
        createdAt: '2025-08-28T08:00:00Z',
      },
    ];

    // 3. Seed 100 Customers
    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
      'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
      'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
      'Vikram', 'Ananya', 'Rajesh', 'Priya', 'Aarav', 'Deepika', 'Kavita', 'Sanjay',
      'Lukas', 'Sophie', 'Maximilian', 'Emma', 'Hiroshi', 'Yuki', 'Kenji', 'Sakura',
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
      'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
      'Sharma', 'Patel', 'Verma', 'Reddy', 'Mehta', 'Nair', 'Iyer', 'Gupta',
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Tanaka', 'Sato', 'Suzuki',
    ];
    const countries = ['US', 'GB', 'DE', 'IN', 'SG', 'CA', 'AU', 'FR', 'NL', 'JP'];
    const kycStatuses = [KycStatus.VERIFIED, KycStatus.VERIFIED, KycStatus.VERIFIED, KycStatus.PENDING, KycStatus.REJECTED];

    for (let i = 1; i <= 105; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 3) % lastNames.length];
      const country = countries[i % countries.length];
      const kyc = kycStatuses[i % kycStatuses.length];
      const riskScore = (i * 17) % 95 + 5;
      let riskLevel = RiskLevel.LOW;
      if (riskScore > 80) riskLevel = RiskLevel.CRITICAL;
      else if (riskScore > 60) riskLevel = RiskLevel.HIGH;
      else if (riskScore > 30) riskLevel = RiskLevel.MEDIUM;

      const custId = `cust-${String(i).padStart(3, '0')}`;
      this.customers.push({
        id: custId,
        customerNumber: `CUST-${100000 + i}`,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
        phone: `+1-${200 + (i % 800)}-555-${1000 + i}`,
        country,
        kycStatus: kyc,
        riskLevel,
        riskScore,
        status: riskScore > 90 ? 'SUSPENDED' : 'ACTIVE',
        createdAt: new Date(Date.now() - (120 - i) * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Seed 160 Accounts
    const currencies = [Currency.USD, Currency.EUR, Currency.GBP, Currency.INR, Currency.SGD];
    const accountTypes = [
      AccountType.CHECKING,
      AccountType.SAVINGS,
      AccountType.BUSINESS,
      AccountType.MERCHANT,
      AccountType.WALLET,
    ];

    let accSeq = 1;
    for (const customer of this.customers) {
      const numAccounts = (accSeq % 2) + 1; // 1 or 2 accounts per customer
      for (let a = 0; a < numAccounts; a++) {
        const rawAccNum = `${4000 + accSeq}${String(100000000000 + accSeq * 3729).slice(-12)}`;
        const currency = currencies[(accSeq + a) % currencies.length];
        const accType = accountTypes[(accSeq + a) % accountTypes.length];
        const baseBalance = ((accSeq * 12345.67) % 150000 + 500).toFixed(4);

        const acc: IAccount = {
          id: `acc-${String(accSeq).padStart(3, '0')}`,
          accountNumber: rawAccNum,
          maskedAccountNumber: MaskUtils.maskAccountNumber(rawAccNum),
          customerId: customer.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          accountType: accType,
          currency,
          availableBalance: baseBalance,
          ledgerBalance: baseBalance,
          status: customer.status === 'SUSPENDED' ? AccountStatus.FROZEN : AccountStatus.ACTIVE,
          version: 1,
          createdAt: customer.createdAt,
          updatedAt: new Date().toISOString(),
        };

        this.accounts.push(acc);
        accSeq++;
      }
    }

    // 5. Seed 520 Payments, Transactions, and Double-Entry Ledger Entries
    const paymentMethods = [
      PaymentMethod.CARD,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.ACH,
      PaymentMethod.SEPA,
      PaymentMethod.UPI,
      PaymentMethod.WIRE,
    ];
    const statuses = [
      PaymentStatus.COMPLETED,
      PaymentStatus.COMPLETED,
      PaymentStatus.COMPLETED,
      PaymentStatus.COMPLETED,
      PaymentStatus.PROCESSING,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ];

    for (let p = 1; p <= 520; p++) {
      const srcAcc = this.accounts[(p * 3) % this.accounts.length];
      const destAcc = this.accounts[(p * 7 + 1) % this.accounts.length];
      const customer = this.customers.find((c) => c.id === srcAcc.customerId) || this.customers[0];
      const status = statuses[p % statuses.length];
      const method = paymentMethods[p % paymentMethods.length];
      const amountNum = (p * 47.85) % 12500 + 10;
      const amountStr = MoneyMath.toDbString(amountNum);
      const riskScore = (p * 23) % 100;
      const payRef = `PAY-${800000 + p}`;
      const payDate = new Date(Date.now() - (100 - Math.floor(p / 6)) * 86400000 + (p % 86400000)).toISOString();

      const payment: IPayment = {
        id: `pay-${String(p).padStart(4, '0')}`,
        paymentReference: payRef,
        idempotencyKey: `idemp-key-${p}-${Date.now()}`,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        sourceAccountId: srcAcc.id,
        sourceAccountNumber: srcAcc.maskedAccountNumber,
        destinationAccountId: destAcc.id,
        destinationAccountNumber: destAcc.maskedAccountNumber,
        amount: amountStr,
        currency: srcAcc.currency,
        paymentMethod: method,
        status,
        provider: PaymentProvider.MOCK_BANK_RAIL,
        providerReference: `RAIL-TXN-${900000 + p}`,
        riskScore,
        failureReason: status === PaymentStatus.FAILED ? 'Insufficient balance or bank network timeout' : undefined,
        createdAt: payDate,
        updatedAt: payDate,
      };
      this.payments.push(payment);

      // Create Transactions & Double-Entry Ledger for Completed or Settled payments
      if (status === PaymentStatus.COMPLETED || status === PaymentStatus.REFUNDED) {
        const txIdDebit = `tx-${String(p * 2 - 1).padStart(5, '0')}`;
        const txRefDebit = `TXN-DEB-${800000 + p}`;
        const balBeforeSrc = srcAcc.availableBalance;
        const balAfterSrc = MoneyMath.toDbString(
          MoneyMath.isGreaterThanOrEqualTo(balBeforeSrc, amountStr)
            ? MoneyMath.subtract(balBeforeSrc, amountStr)
            : balBeforeSrc,
        );

        const txDebit: ITransaction = {
          id: txIdDebit,
          transactionReference: txRefDebit,
          paymentId: payment.id,
          accountId: srcAcc.id,
          accountNumber: srcAcc.maskedAccountNumber,
          type: TransactionType.TRANSFER,
          amount: amountStr,
          currency: srcAcc.currency,
          direction: TransactionDirection.OUTBOUND,
          status: TransactionStatus.SETTLED,
          balanceBefore: balBeforeSrc,
          balanceAfter: balAfterSrc,
          description: `Transfer to ${destAcc.maskedAccountNumber} - Ref ${payRef}`,
          createdAt: payDate,
        };
        this.transactions.push(txDebit);

        // Double-Entry Ledger Entry: Debit Source
        this.ledgerEntries.push({
          id: `led-${String(p * 2 - 1).padStart(5, '0')}`,
          transactionId: txDebit.id,
          accountId: srcAcc.id,
          accountNumber: srcAcc.maskedAccountNumber,
          entryType: LedgerEntryType.DEBIT,
          amount: amountStr,
          currency: srcAcc.currency,
          postedAt: payDate,
        });

        // Credit Destination
        const txIdCredit = `tx-${String(p * 2).padStart(5, '0')}`;
        const txRefCredit = `TXN-CRD-${800000 + p}`;
        const balBeforeDest = destAcc.availableBalance;
        const balAfterDest = MoneyMath.toDbString(MoneyMath.add(balBeforeDest, amountStr));

        const txCredit: ITransaction = {
          id: txIdCredit,
          transactionReference: txRefCredit,
          paymentId: payment.id,
          accountId: destAcc.id,
          accountNumber: destAcc.maskedAccountNumber,
          type: TransactionType.TRANSFER,
          amount: amountStr,
          currency: destAcc.currency,
          direction: TransactionDirection.INBOUND,
          status: TransactionStatus.SETTLED,
          balanceBefore: balBeforeDest,
          balanceAfter: balAfterDest,
          description: `Transfer from ${srcAcc.maskedAccountNumber} - Ref ${payRef}`,
          createdAt: payDate,
        };
        this.transactions.push(txCredit);

        // Double-Entry Ledger Entry: Credit Destination
        this.ledgerEntries.push({
          id: `led-${String(p * 2).padStart(5, '0')}`,
          transactionId: txCredit.id,
          accountId: destAcc.id,
          accountNumber: destAcc.maskedAccountNumber,
          entryType: LedgerEntryType.CREDIT,
          amount: amountStr,
          currency: destAcc.currency,
          postedAt: payDate,
        });
      }

      // 6. Generate 60+ Fraud Alerts for high-risk payments
      if (riskScore >= 65 || p % 8 === 0) {
        const alertId = `alert-${String(this.fraudAlerts.length + 1).padStart(3, '0')}`;
        let alertLevel = RiskLevel.MEDIUM;
        if (riskScore > 85) alertLevel = RiskLevel.CRITICAL;
        else if (riskScore > 65) alertLevel = RiskLevel.HIGH;

        const alertStatuses = [
          FraudAlertStatus.OPEN,
          FraudAlertStatus.INVESTIGATING,
          FraudAlertStatus.CONFIRMED,
          FraudAlertStatus.FALSE_POSITIVE,
          FraudAlertStatus.RESOLVED,
        ];
        const alertStatus = alertStatuses[p % alertStatuses.length];

        const triggeredRules = [];
        if (amountNum > 5000) {
          triggeredRules.push({
            ruleCode: FraudRuleCode.RULE_HIGH_VALUE,
            ruleName: 'High Value Transaction Anomaly',
            score: 35,
            details: `Amount of $${amountStr} exceeded threshold of $5,000.00`,
          });
        }
        if (p % 3 === 0) {
          triggeredRules.push({
            ruleCode: FraudRuleCode.RULE_VELOCITY,
            ruleName: 'Rapid Velocity Spikes',
            score: 25,
            details: '6 transactions observed within 7 minutes from IP subnet.',
          });
        }
        if (p % 5 === 0) {
          triggeredRules.push({
            ruleCode: FraudRuleCode.RULE_GEO_ANOMALY,
            ruleName: 'Geographic Impossibility / Velocity',
            score: 40,
            details: 'Origin IP in Germany followed by request in Singapore 12 minutes later.',
          });
        }
        if (triggeredRules.length === 0) {
          triggeredRules.push({
            ruleCode: FraudRuleCode.RULE_DEVICE_ANOMALY,
            ruleName: 'Unrecognized Device Fingerprint',
            score: 20,
            details: 'Unfamiliar macOS / Safari browser configuration without cookie history.',
          });
        }

        this.fraudAlerts.push({
          id: alertId,
          alertReference: `ALT-${90000 + this.fraudAlerts.length + 1}`,
          paymentId: payment.id,
          paymentReference: payment.paymentReference,
          customerId: customer.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          amount: payment.amount,
          currency: payment.currency,
          ruleId: this.fraudRules[0].id,
          ruleName: triggeredRules[0].ruleName,
          riskScore,
          riskLevel: alertLevel,
          status: alertStatus,
          triggers: triggeredRules,
          createdAt: payDate,
          updatedAt: payDate,
        });
      }
    }

    // 7. Seed Notifications
    this.notifications = [
      {
        id: 'notif-001',
        type: NotificationType.FRAUD_ALERT,
        title: 'Critical Fraud Alert Triggered',
        message: 'High-value transaction PAY-829301 was flagged with Risk Score 87 (Geo-anomaly).',
        severity: 'CRITICAL',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: 'notif-002',
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'High-Volume Wire Settled',
        message: 'Payment PAY-829290 for $84,500.00 USD settled successfully through Federal Reserve rail.',
        severity: 'SUCCESS',
        isRead: false,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
      {
        id: 'notif-003',
        type: NotificationType.ACCOUNT_ALERT,
        title: 'Account Frozen by Risk Engine',
        message: 'Customer Marcus Vance account ****4521 was temporarily frozen following suspicious velocity.',
        severity: 'WARNING',
        isRead: true,
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
      {
        id: 'notif-004',
        type: NotificationType.SYSTEM_ALERT,
        title: 'Kafka Outbox Relay Synced',
        message: '1,040 domain events were successfully published to Kafka brokers.',
        severity: 'INFO',
        isRead: true,
        createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
      },
    ];

    // 8. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'audit-001',
        userEmail: 'admin@finpay360.io',
        action: AuditAction.USER_LOGIN,
        entityType: 'User',
        entityId: 'usr-admin-001',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        result: 'SUCCESS',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'audit-002',
        userEmail: 'ops@finpay360.io',
        action: AuditAction.REFUND_PAYMENT,
        entityType: 'Payment',
        entityId: 'pay-0012',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        result: 'SUCCESS',
        beforeState: { status: 'COMPLETED', amount: '1250.0000' },
        afterState: { status: 'REFUNDED', amount: '1250.0000' },
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: 'audit-003',
        userEmail: 'risk@finpay360.io',
        action: AuditAction.RESOLVE_FRAUD_ALERT,
        entityType: 'FraudAlert',
        entityId: 'alert-005',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        result: 'SUCCESS',
        beforeState: { status: 'OPEN', riskScore: 84 },
        afterState: { status: 'CONFIRMED', riskScore: 84 },
        createdAt: new Date(Date.now() - 300000).toISOString(),
      },
    ];

    this.logger.log(
      `Seeded: ${this.customers.length} Customers, ${this.accounts.length} Accounts, ${this.payments.length} Payments, ${this.transactions.length} Transactions, ${this.fraudAlerts.length} Fraud Alerts.`,
    );
  }
}
