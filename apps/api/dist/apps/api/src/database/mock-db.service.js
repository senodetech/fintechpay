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
var MockDbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDbService = void 0;
const common_1 = require("@nestjs/common");
const shared_types_1 = require("@finpay360/shared-types");
const money_math_1 = require("../common/utils/money-math");
const mask_utils_1 = require("../common/utils/mask-utils");
let MockDbService = MockDbService_1 = class MockDbService {
    logger = new common_1.Logger(MockDbService_1.name);
    users = [];
    customers = [];
    accounts = [];
    payments = [];
    transactions = [];
    ledgerEntries = [];
    fraudRules = [];
    fraudAlerts = [];
    notifications = [];
    auditLogs = [];
    constructor() {
        this.seedInitialData();
    }
    seedInitialData() {
        this.logger.log('Seeding enterprise FinTech dataset (100+ customers, 150+ accounts, 1000+ txs, 50+ alerts)...');
        this.users = [
            {
                id: 'usr-admin-001',
                externalAuthId: 'auth0|admin-001',
                email: 'admin@finpay360.io',
                firstName: 'Alexander',
                lastName: 'Vance',
                roles: [shared_types_1.Role.ADMIN],
                permissions: Object.values(shared_types_1.Permission),
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
                roles: [shared_types_1.Role.OPERATIONS],
                permissions: [
                    shared_types_1.Permission.USERS_READ,
                    shared_types_1.Permission.ACCOUNTS_READ,
                    shared_types_1.Permission.ACCOUNTS_WRITE,
                    shared_types_1.Permission.PAYMENTS_READ,
                    shared_types_1.Permission.PAYMENTS_WRITE,
                    shared_types_1.Permission.PAYMENTS_REFUND,
                    shared_types_1.Permission.TRANSACTIONS_READ,
                    shared_types_1.Permission.TRANSACTIONS_EXPORT,
                    shared_types_1.Permission.FRAUD_READ,
                    shared_types_1.Permission.REPORTS_READ,
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
                roles: [shared_types_1.Role.FINANCE],
                permissions: [
                    shared_types_1.Permission.PAYMENTS_READ,
                    shared_types_1.Permission.PAYMENTS_WRITE,
                    shared_types_1.Permission.PAYMENTS_REFUND,
                    shared_types_1.Permission.TRANSACTIONS_READ,
                    shared_types_1.Permission.TRANSACTIONS_EXPORT,
                    shared_types_1.Permission.REPORTS_READ,
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
                roles: [shared_types_1.Role.RISK_ANALYST],
                permissions: [
                    shared_types_1.Permission.FRAUD_READ,
                    shared_types_1.Permission.FRAUD_WRITE,
                    shared_types_1.Permission.TRANSACTIONS_READ,
                    shared_types_1.Permission.TRANSACTIONS_EXPORT,
                    shared_types_1.Permission.PAYMENTS_READ,
                    shared_types_1.Permission.REPORTS_READ,
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
                roles: [shared_types_1.Role.CUSTOMER_SUPPORT],
                permissions: [
                    shared_types_1.Permission.ACCOUNTS_READ,
                    shared_types_1.Permission.ACCOUNTS_WRITE,
                    shared_types_1.Permission.PAYMENTS_READ,
                    shared_types_1.Permission.TRANSACTIONS_READ,
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
                roles: [shared_types_1.Role.AUDITOR],
                permissions: [
                    shared_types_1.Permission.USERS_READ,
                    shared_types_1.Permission.ACCOUNTS_READ,
                    shared_types_1.Permission.PAYMENTS_READ,
                    shared_types_1.Permission.TRANSACTIONS_READ,
                    shared_types_1.Permission.TRANSACTIONS_EXPORT,
                    shared_types_1.Permission.FRAUD_READ,
                    shared_types_1.Permission.REPORTS_READ,
                    shared_types_1.Permission.AUDIT_READ,
                ],
                status: 'ACTIVE',
                lastLoginAt: new Date().toISOString(),
                createdAt: '2025-08-28T10:15:00Z',
                updatedAt: new Date().toISOString(),
            },
        ];
        this.fraudRules = [
            {
                id: 'rule-01',
                ruleCode: shared_types_1.FraudRuleCode.RULE_HIGH_VALUE,
                name: 'High Value Transaction Anomaly',
                description: 'Flags transactions exceeding $50,000 or 5x the customer 30-day baseline average.',
                criteria: { thresholdAmount: 50000, velocityMultiplier: 5 },
                scoreWeight: 35,
                isActive: true,
                createdAt: '2025-08-28T08:00:00Z',
            },
            {
                id: 'rule-02',
                ruleCode: shared_types_1.FraudRuleCode.RULE_VELOCITY,
                name: 'Rapid Velocity Spikes',
                description: 'Triggers when more than 5 transactions are executed in a 10-minute sliding window.',
                criteria: { maxTransactions: 5, timeWindowMinutes: 10 },
                scoreWeight: 25,
                isActive: true,
                createdAt: '2025-08-28T08:00:00Z',
            },
            {
                id: 'rule-03',
                ruleCode: shared_types_1.FraudRuleCode.RULE_GEO_ANOMALY,
                name: 'Geographic Impossibility / Velocity',
                description: 'Flags transactions occurring across two distinct countries within impossible flight time.',
                criteria: { maxSpeedKmh: 850 },
                scoreWeight: 40,
                isActive: true,
                createdAt: '2025-08-28T08:00:00Z',
            },
            {
                id: 'rule-04',
                ruleCode: shared_types_1.FraudRuleCode.RULE_HIGH_RISK_COUNTRY,
                name: 'FATF High-Risk Jurisdiction Check',
                description: 'Elevates risk score when transaction originates or terminates in FATF watchlist countries.',
                criteria: { highRiskCountries: ['KP', 'IR', 'MM', 'SY'] },
                scoreWeight: 45,
                isActive: true,
                createdAt: '2025-08-28T08:00:00Z',
            },
            {
                id: 'rule-05',
                ruleCode: shared_types_1.FraudRuleCode.RULE_DEVICE_ANOMALY,
                name: 'Unrecognized Device Fingerprint',
                description: 'Flags transactions initiated from a new device/browser with high-value transfer.',
                criteria: { require2FA: true },
                scoreWeight: 20,
                isActive: true,
                createdAt: '2025-08-28T08:00:00Z',
            },
            {
                id: 'rule-06',
                ruleCode: shared_types_1.FraudRuleCode.RULE_AUTH_FAILURE,
                name: 'Repeated Authentication Failures',
                description: 'Triggers when 3 or more 2FA/Password failures occur prior to payment initiation.',
                criteria: { failureThreshold: 3, windowHours: 1 },
                scoreWeight: 30,
                isActive: true,
                createdAt: '2025-08-28T08:00:00Z',
            },
        ];
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
        const kycStatuses = [shared_types_1.KycStatus.VERIFIED, shared_types_1.KycStatus.VERIFIED, shared_types_1.KycStatus.VERIFIED, shared_types_1.KycStatus.PENDING, shared_types_1.KycStatus.REJECTED];
        for (let i = 1; i <= 105; i++) {
            const fn = firstNames[i % firstNames.length];
            const ln = lastNames[(i * 3) % lastNames.length];
            const country = countries[i % countries.length];
            const kyc = kycStatuses[i % kycStatuses.length];
            const riskScore = (i * 17) % 95 + 5;
            let riskLevel = shared_types_1.RiskLevel.LOW;
            if (riskScore > 80)
                riskLevel = shared_types_1.RiskLevel.CRITICAL;
            else if (riskScore > 60)
                riskLevel = shared_types_1.RiskLevel.HIGH;
            else if (riskScore > 30)
                riskLevel = shared_types_1.RiskLevel.MEDIUM;
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
        const currencies = [shared_types_1.Currency.USD, shared_types_1.Currency.EUR, shared_types_1.Currency.GBP, shared_types_1.Currency.INR, shared_types_1.Currency.SGD];
        const accountTypes = [
            shared_types_1.AccountType.CHECKING,
            shared_types_1.AccountType.SAVINGS,
            shared_types_1.AccountType.BUSINESS,
            shared_types_1.AccountType.MERCHANT,
            shared_types_1.AccountType.WALLET,
        ];
        let accSeq = 1;
        for (const customer of this.customers) {
            const numAccounts = (accSeq % 2) + 1;
            for (let a = 0; a < numAccounts; a++) {
                const rawAccNum = `${4000 + accSeq}${String(100000000000 + accSeq * 3729).slice(-12)}`;
                const currency = currencies[(accSeq + a) % currencies.length];
                const accType = accountTypes[(accSeq + a) % accountTypes.length];
                const baseBalance = ((accSeq * 12345.67) % 150000 + 500).toFixed(4);
                const acc = {
                    id: `acc-${String(accSeq).padStart(3, '0')}`,
                    accountNumber: rawAccNum,
                    maskedAccountNumber: mask_utils_1.MaskUtils.maskAccountNumber(rawAccNum),
                    customerId: customer.id,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    accountType: accType,
                    currency,
                    availableBalance: baseBalance,
                    ledgerBalance: baseBalance,
                    status: customer.status === 'SUSPENDED' ? shared_types_1.AccountStatus.FROZEN : shared_types_1.AccountStatus.ACTIVE,
                    version: 1,
                    createdAt: customer.createdAt,
                    updatedAt: new Date().toISOString(),
                };
                this.accounts.push(acc);
                accSeq++;
            }
        }
        const paymentMethods = [
            shared_types_1.PaymentMethod.CARD,
            shared_types_1.PaymentMethod.BANK_TRANSFER,
            shared_types_1.PaymentMethod.ACH,
            shared_types_1.PaymentMethod.SEPA,
            shared_types_1.PaymentMethod.UPI,
            shared_types_1.PaymentMethod.WIRE,
        ];
        const statuses = [
            shared_types_1.PaymentStatus.COMPLETED,
            shared_types_1.PaymentStatus.COMPLETED,
            shared_types_1.PaymentStatus.COMPLETED,
            shared_types_1.PaymentStatus.COMPLETED,
            shared_types_1.PaymentStatus.PROCESSING,
            shared_types_1.PaymentStatus.FAILED,
            shared_types_1.PaymentStatus.REFUNDED,
        ];
        for (let p = 1; p <= 520; p++) {
            const srcAcc = this.accounts[(p * 3) % this.accounts.length];
            const destAcc = this.accounts[(p * 7 + 1) % this.accounts.length];
            const customer = this.customers.find((c) => c.id === srcAcc.customerId) || this.customers[0];
            const status = statuses[p % statuses.length];
            const method = paymentMethods[p % paymentMethods.length];
            const amountNum = (p * 47.85) % 12500 + 10;
            const amountStr = money_math_1.MoneyMath.toDbString(amountNum);
            const riskScore = (p * 23) % 100;
            const payRef = `PAY-${800000 + p}`;
            const payDate = new Date(Date.now() - (100 - Math.floor(p / 6)) * 86400000 + (p % 86400000)).toISOString();
            const payment = {
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
                provider: shared_types_1.PaymentProvider.MOCK_BANK_RAIL,
                providerReference: `RAIL-TXN-${900000 + p}`,
                riskScore,
                failureReason: status === shared_types_1.PaymentStatus.FAILED ? 'Insufficient balance or bank network timeout' : undefined,
                createdAt: payDate,
                updatedAt: payDate,
            };
            this.payments.push(payment);
            if (status === shared_types_1.PaymentStatus.COMPLETED || status === shared_types_1.PaymentStatus.REFUNDED) {
                const txIdDebit = `tx-${String(p * 2 - 1).padStart(5, '0')}`;
                const txRefDebit = `TXN-DEB-${800000 + p}`;
                const balBeforeSrc = srcAcc.availableBalance;
                const balAfterSrc = money_math_1.MoneyMath.toDbString(money_math_1.MoneyMath.isGreaterThanOrEqualTo(balBeforeSrc, amountStr)
                    ? money_math_1.MoneyMath.subtract(balBeforeSrc, amountStr)
                    : balBeforeSrc);
                const txDebit = {
                    id: txIdDebit,
                    transactionReference: txRefDebit,
                    paymentId: payment.id,
                    accountId: srcAcc.id,
                    accountNumber: srcAcc.maskedAccountNumber,
                    type: shared_types_1.TransactionType.TRANSFER,
                    amount: amountStr,
                    currency: srcAcc.currency,
                    direction: shared_types_1.TransactionDirection.OUTBOUND,
                    status: shared_types_1.TransactionStatus.SETTLED,
                    balanceBefore: balBeforeSrc,
                    balanceAfter: balAfterSrc,
                    description: `Transfer to ${destAcc.maskedAccountNumber} - Ref ${payRef}`,
                    createdAt: payDate,
                };
                this.transactions.push(txDebit);
                this.ledgerEntries.push({
                    id: `led-${String(p * 2 - 1).padStart(5, '0')}`,
                    transactionId: txDebit.id,
                    accountId: srcAcc.id,
                    accountNumber: srcAcc.maskedAccountNumber,
                    entryType: shared_types_1.LedgerEntryType.DEBIT,
                    amount: amountStr,
                    currency: srcAcc.currency,
                    postedAt: payDate,
                });
                const txIdCredit = `tx-${String(p * 2).padStart(5, '0')}`;
                const txRefCredit = `TXN-CRD-${800000 + p}`;
                const balBeforeDest = destAcc.availableBalance;
                const balAfterDest = money_math_1.MoneyMath.toDbString(money_math_1.MoneyMath.add(balBeforeDest, amountStr));
                const txCredit = {
                    id: txIdCredit,
                    transactionReference: txRefCredit,
                    paymentId: payment.id,
                    accountId: destAcc.id,
                    accountNumber: destAcc.maskedAccountNumber,
                    type: shared_types_1.TransactionType.TRANSFER,
                    amount: amountStr,
                    currency: destAcc.currency,
                    direction: shared_types_1.TransactionDirection.INBOUND,
                    status: shared_types_1.TransactionStatus.SETTLED,
                    balanceBefore: balBeforeDest,
                    balanceAfter: balAfterDest,
                    description: `Transfer from ${srcAcc.maskedAccountNumber} - Ref ${payRef}`,
                    createdAt: payDate,
                };
                this.transactions.push(txCredit);
                this.ledgerEntries.push({
                    id: `led-${String(p * 2).padStart(5, '0')}`,
                    transactionId: txCredit.id,
                    accountId: destAcc.id,
                    accountNumber: destAcc.maskedAccountNumber,
                    entryType: shared_types_1.LedgerEntryType.CREDIT,
                    amount: amountStr,
                    currency: destAcc.currency,
                    postedAt: payDate,
                });
            }
            if (riskScore >= 65 || p % 8 === 0) {
                const alertId = `alert-${String(this.fraudAlerts.length + 1).padStart(3, '0')}`;
                let alertLevel = shared_types_1.RiskLevel.MEDIUM;
                if (riskScore > 85)
                    alertLevel = shared_types_1.RiskLevel.CRITICAL;
                else if (riskScore > 65)
                    alertLevel = shared_types_1.RiskLevel.HIGH;
                const alertStatuses = [
                    shared_types_1.FraudAlertStatus.OPEN,
                    shared_types_1.FraudAlertStatus.INVESTIGATING,
                    shared_types_1.FraudAlertStatus.CONFIRMED,
                    shared_types_1.FraudAlertStatus.FALSE_POSITIVE,
                    shared_types_1.FraudAlertStatus.RESOLVED,
                ];
                const alertStatus = alertStatuses[p % alertStatuses.length];
                const triggeredRules = [];
                if (amountNum > 5000) {
                    triggeredRules.push({
                        ruleCode: shared_types_1.FraudRuleCode.RULE_HIGH_VALUE,
                        ruleName: 'High Value Transaction Anomaly',
                        score: 35,
                        details: `Amount of $${amountStr} exceeded threshold of $5,000.00`,
                    });
                }
                if (p % 3 === 0) {
                    triggeredRules.push({
                        ruleCode: shared_types_1.FraudRuleCode.RULE_VELOCITY,
                        ruleName: 'Rapid Velocity Spikes',
                        score: 25,
                        details: '6 transactions observed within 7 minutes from IP subnet.',
                    });
                }
                if (p % 5 === 0) {
                    triggeredRules.push({
                        ruleCode: shared_types_1.FraudRuleCode.RULE_GEO_ANOMALY,
                        ruleName: 'Geographic Impossibility / Velocity',
                        score: 40,
                        details: 'Origin IP in Germany followed by request in Singapore 12 minutes later.',
                    });
                }
                if (triggeredRules.length === 0) {
                    triggeredRules.push({
                        ruleCode: shared_types_1.FraudRuleCode.RULE_DEVICE_ANOMALY,
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
        this.notifications = [
            {
                id: 'notif-001',
                type: shared_types_1.NotificationType.FRAUD_ALERT,
                title: 'Critical Fraud Alert Triggered',
                message: 'High-value transaction PAY-829301 was flagged with Risk Score 87 (Geo-anomaly).',
                severity: 'CRITICAL',
                isRead: false,
                createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
            },
            {
                id: 'notif-002',
                type: shared_types_1.NotificationType.PAYMENT_SUCCESS,
                title: 'High-Volume Wire Settled',
                message: 'Payment PAY-829290 for $84,500.00 USD settled successfully through Federal Reserve rail.',
                severity: 'SUCCESS',
                isRead: false,
                createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
            },
            {
                id: 'notif-003',
                type: shared_types_1.NotificationType.ACCOUNT_ALERT,
                title: 'Account Frozen by Risk Engine',
                message: 'Customer Marcus Vance account ****4521 was temporarily frozen following suspicious velocity.',
                severity: 'WARNING',
                isRead: true,
                createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
            },
            {
                id: 'notif-004',
                type: shared_types_1.NotificationType.SYSTEM_ALERT,
                title: 'Kafka Outbox Relay Synced',
                message: '1,040 domain events were successfully published to Kafka brokers.',
                severity: 'INFO',
                isRead: true,
                createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
            },
        ];
        this.auditLogs = [
            {
                id: 'audit-001',
                userEmail: 'admin@finpay360.io',
                action: shared_types_1.AuditAction.USER_LOGIN,
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
                action: shared_types_1.AuditAction.REFUND_PAYMENT,
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
                action: shared_types_1.AuditAction.RESOLVE_FRAUD_ALERT,
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
        this.logger.log(`Seeded: ${this.customers.length} Customers, ${this.accounts.length} Accounts, ${this.payments.length} Payments, ${this.transactions.length} Transactions, ${this.fraudAlerts.length} Fraud Alerts.`);
    }
};
exports.MockDbService = MockDbService;
exports.MockDbService = MockDbService = MockDbService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MockDbService);
//# sourceMappingURL=mock-db.service.js.map