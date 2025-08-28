"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.NotificationType = exports.FraudRuleCode = exports.FraudAlertStatus = exports.RiskLevel = exports.KycStatus = exports.LedgerEntryType = exports.TransactionStatus = exports.TransactionDirection = exports.TransactionType = exports.Currency = exports.AccountStatus = exports.AccountType = exports.PaymentProvider = exports.PaymentMethod = exports.PaymentStatus = exports.Permission = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["OPERATIONS"] = "OPERATIONS";
    Role["FINANCE"] = "FINANCE";
    Role["RISK_ANALYST"] = "RISK_ANALYST";
    Role["CUSTOMER_SUPPORT"] = "CUSTOMER_SUPPORT";
    Role["CUSTOMER"] = "CUSTOMER";
    Role["AUDITOR"] = "AUDITOR";
})(Role || (exports.Role = Role = {}));
var Permission;
(function (Permission) {
    Permission["USERS_READ"] = "users:read";
    Permission["USERS_WRITE"] = "users:write";
    Permission["ACCOUNTS_READ"] = "accounts:read";
    Permission["ACCOUNTS_WRITE"] = "accounts:write";
    Permission["PAYMENTS_READ"] = "payments:read";
    Permission["PAYMENTS_WRITE"] = "payments:write";
    Permission["PAYMENTS_REFUND"] = "payments:refund";
    Permission["TRANSACTIONS_READ"] = "transactions:read";
    Permission["TRANSACTIONS_EXPORT"] = "transactions:export";
    Permission["FRAUD_READ"] = "fraud:read";
    Permission["FRAUD_WRITE"] = "fraud:write";
    Permission["REPORTS_READ"] = "reports:read";
    Permission["AUDIT_READ"] = "audit:read";
})(Permission || (exports.Permission = Permission = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["INITIATED"] = "INITIATED";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
    PaymentStatus["CHARGEBACK"] = "CHARGEBACK";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["ACH"] = "ACH";
    PaymentMethod["SEPA"] = "SEPA";
    PaymentMethod["WIRE"] = "WIRE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["ADYEN"] = "ADYEN";
    PaymentProvider["MOCK_BANK_RAIL"] = "MOCK_BANK_RAIL";
    PaymentProvider["SWIFT"] = "SWIFT";
    PaymentProvider["SEPA_CORE"] = "SEPA_CORE";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var AccountType;
(function (AccountType) {
    AccountType["CHECKING"] = "CHECKING";
    AccountType["SAVINGS"] = "SAVINGS";
    AccountType["BUSINESS"] = "BUSINESS";
    AccountType["MERCHANT"] = "MERCHANT";
    AccountType["WALLET"] = "WALLET";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["FROZEN"] = "FROZEN";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["CLOSED"] = "CLOSED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
    Currency["INR"] = "INR";
    Currency["JPY"] = "JPY";
    Currency["CAD"] = "CAD";
    Currency["AUD"] = "AUD";
    Currency["SGD"] = "SGD";
})(Currency || (exports.Currency = Currency = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEBIT"] = "DEBIT";
    TransactionType["CREDIT"] = "CREDIT";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["PAYMENT"] = "PAYMENT";
    TransactionType["REFUND"] = "REFUND";
    TransactionType["FEE"] = "FEE";
    TransactionType["CHARGEBACK"] = "CHARGEBACK";
    TransactionType["ADJUSTMENT"] = "ADJUSTMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionDirection;
(function (TransactionDirection) {
    TransactionDirection["INBOUND"] = "INBOUND";
    TransactionDirection["OUTBOUND"] = "OUTBOUND";
    TransactionDirection["INTERNAL"] = "INTERNAL";
})(TransactionDirection || (exports.TransactionDirection = TransactionDirection = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["POSTED"] = "POSTED";
    TransactionStatus["SETTLED"] = "SETTLED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REVERSED"] = "REVERSED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var LedgerEntryType;
(function (LedgerEntryType) {
    LedgerEntryType["DEBIT"] = "DEBIT";
    LedgerEntryType["CREDIT"] = "CREDIT";
})(LedgerEntryType || (exports.LedgerEntryType = LedgerEntryType = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["REJECTED"] = "REJECTED";
    KycStatus["EXPIRED"] = "EXPIRED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var FraudAlertStatus;
(function (FraudAlertStatus) {
    FraudAlertStatus["OPEN"] = "OPEN";
    FraudAlertStatus["INVESTIGATING"] = "INVESTIGATING";
    FraudAlertStatus["CONFIRMED"] = "CONFIRMED";
    FraudAlertStatus["FALSE_POSITIVE"] = "FALSE_POSITIVE";
    FraudAlertStatus["RESOLVED"] = "RESOLVED";
})(FraudAlertStatus || (exports.FraudAlertStatus = FraudAlertStatus = {}));
var FraudRuleCode;
(function (FraudRuleCode) {
    FraudRuleCode["RULE_HIGH_VALUE"] = "RULE_HIGH_VALUE";
    FraudRuleCode["RULE_VELOCITY"] = "RULE_VELOCITY";
    FraudRuleCode["RULE_GEO_ANOMALY"] = "RULE_GEO_ANOMALY";
    FraudRuleCode["RULE_HIGH_RISK_COUNTRY"] = "RULE_HIGH_RISK_COUNTRY";
    FraudRuleCode["RULE_DEVICE_ANOMALY"] = "RULE_DEVICE_ANOMALY";
    FraudRuleCode["RULE_AUTH_FAILURE"] = "RULE_AUTH_FAILURE";
})(FraudRuleCode || (exports.FraudRuleCode = FraudRuleCode = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    NotificationType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    NotificationType["FRAUD_ALERT"] = "FRAUD_ALERT";
    NotificationType["ACCOUNT_ALERT"] = "ACCOUNT_ALERT";
    NotificationType["SECURITY_ALERT"] = "SECURITY_ALERT";
    NotificationType["SYSTEM_ALERT"] = "SYSTEM_ALERT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_LOGIN"] = "USER_LOGIN";
    AuditAction["USER_LOGOUT"] = "USER_LOGOUT";
    AuditAction["CREATE_PAYMENT"] = "CREATE_PAYMENT";
    AuditAction["REFUND_PAYMENT"] = "REFUND_PAYMENT";
    AuditAction["CANCEL_PAYMENT"] = "CANCEL_PAYMENT";
    AuditAction["FREEZE_ACCOUNT"] = "FREEZE_ACCOUNT";
    AuditAction["UNFREEZE_ACCOUNT"] = "UNFREEZE_ACCOUNT";
    AuditAction["UPDATE_KYC"] = "UPDATE_KYC";
    AuditAction["UPDATE_FRAUD_RULE"] = "UPDATE_FRAUD_RULE";
    AuditAction["RESOLVE_FRAUD_ALERT"] = "RESOLVE_FRAUD_ALERT";
    AuditAction["UPDATE_ROLE_PERMISSIONS"] = "UPDATE_ROLE_PERMISSIONS";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=index.js.map