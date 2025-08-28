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
var FraudEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudEngineService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
const shared_types_1 = require("@finpay360/shared-types");
const money_math_1 = require("../../common/utils/money-math");
let FraudEngineService = FraudEngineService_1 = class FraudEngineService {
    mockDb;
    logger = new common_1.Logger(FraudEngineService_1.name);
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    evaluatePayment(params) {
        const customer = this.mockDb.customers.find((c) => c.id === params.customerId);
        const triggeredRules = [];
        let cumulativeScore = customer ? Math.floor(customer.riskScore * 0.2) : 5;
        const amountNum = parseFloat(params.amount);
        const highValRule = this.mockDb.fraudRules.find((r) => r.ruleCode === shared_types_1.FraudRuleCode.RULE_HIGH_VALUE && r.isActive);
        if (highValRule && amountNum >= 10000) {
            const score = amountNum > 50000 ? 40 : 25;
            cumulativeScore += score;
            triggeredRules.push({
                ruleCode: highValRule.ruleCode,
                ruleName: highValRule.name,
                score,
                details: `Amount of $${money_math_1.MoneyMath.toDisplayString(amountNum)} exceeded threshold ($10,000.00).`,
            });
        }
        const velocityRule = this.mockDb.fraudRules.find((r) => r.ruleCode === shared_types_1.FraudRuleCode.RULE_VELOCITY && r.isActive);
        const tenMinsAgo = Date.now() - 10 * 60000;
        const recentTxCount = this.mockDb.payments.filter((p) => p.customerId === params.customerId && new Date(p.createdAt).getTime() > tenMinsAgo).length;
        if (velocityRule && recentTxCount >= 3) {
            cumulativeScore += velocityRule.scoreWeight;
            triggeredRules.push({
                ruleCode: velocityRule.ruleCode,
                ruleName: velocityRule.name,
                score: velocityRule.scoreWeight,
                details: `High transaction frequency: ${recentTxCount + 1} payment requests detected within 10 minutes.`,
            });
        }
        const geoRule = this.mockDb.fraudRules.find((r) => r.ruleCode === shared_types_1.FraudRuleCode.RULE_GEO_ANOMALY && r.isActive);
        if (geoRule && params.metadata?.geoAnomalous) {
            cumulativeScore += geoRule.scoreWeight;
            triggeredRules.push({
                ruleCode: geoRule.ruleCode,
                ruleName: geoRule.name,
                score: geoRule.scoreWeight,
                details: 'Geographic distance impossible within elapsed travel time window.',
            });
        }
        const countryRule = this.mockDb.fraudRules.find((r) => r.ruleCode === shared_types_1.FraudRuleCode.RULE_HIGH_RISK_COUNTRY && r.isActive);
        const highRiskList = ['KP', 'IR', 'MM', 'SY'];
        if (countryRule && customer && highRiskList.includes(customer.country)) {
            cumulativeScore += countryRule.scoreWeight;
            triggeredRules.push({
                ruleCode: countryRule.ruleCode,
                ruleName: countryRule.name,
                score: countryRule.scoreWeight,
                details: `Origin country (${customer.country}) matches sanctioned jurisdiction watchlist.`,
            });
        }
        const finalScore = Math.min(100, Math.max(0, cumulativeScore));
        let riskLevel = shared_types_1.RiskLevel.LOW;
        let decision = 'ALLOW';
        if (finalScore >= 81) {
            riskLevel = shared_types_1.RiskLevel.CRITICAL;
            decision = 'BLOCK';
        }
        else if (finalScore >= 61) {
            riskLevel = shared_types_1.RiskLevel.HIGH;
            decision = 'REVIEW';
        }
        else if (finalScore >= 31) {
            riskLevel = shared_types_1.RiskLevel.MEDIUM;
            decision = 'CHALLENGE';
        }
        return {
            riskScore: finalScore,
            riskLevel,
            decision,
            triggeredRules,
        };
    }
    getAlerts(filter) {
        let items = [...this.mockDb.fraudAlerts];
        if (filter.search) {
            const s = filter.search.toLowerCase();
            items = items.filter((a) => a.alertReference.toLowerCase().includes(s) ||
                (a.paymentReference && a.paymentReference.toLowerCase().includes(s)) ||
                (a.customerName && a.customerName.toLowerCase().includes(s)));
        }
        if (filter.status) {
            items = items.filter((a) => a.status === filter.status);
        }
        if (filter.riskLevel) {
            items = items.filter((a) => a.riskLevel === filter.riskLevel);
        }
        if (filter.ruleCode) {
            items = items.filter((a) => a.triggers.some((t) => t.ruleCode === filter.ruleCode));
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
    getAlertById(id) {
        const alert = this.mockDb.fraudAlerts.find((a) => a.id === id || a.alertReference === id);
        if (!alert) {
            throw new common_1.NotFoundException(`Fraud alert with ID ${id} was not found.`);
        }
        const customer = this.mockDb.customers.find((c) => c.id === alert.customerId);
        const payment = this.mockDb.payments.find((p) => p.id === alert.paymentId);
        return {
            alert,
            customer,
            payment,
        };
    }
    investigateAlert(id, dto, analystName = 'Security Analyst', analystEmail = 'risk@finpay360.io') {
        const alert = this.mockDb.fraudAlerts.find((a) => a.id === id || a.alertReference === id);
        if (!alert) {
            throw new common_1.NotFoundException(`Fraud alert with ID ${id} was not found.`);
        }
        const beforeState = { status: alert.status };
        alert.status = dto.decision;
        alert.updatedAt = new Date().toISOString();
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: analystEmail,
            action: shared_types_1.AuditAction.RESOLVE_FRAUD_ALERT,
            entityType: 'FraudAlert',
            entityId: alert.id,
            ipAddress: '127.0.0.1',
            userAgent: 'Analyst Workbench',
            result: 'SUCCESS',
            beforeState,
            afterState: { status: alert.status, notes: dto.notes, analystName },
            createdAt: new Date().toISOString(),
        });
        return alert;
    }
    getRules() {
        return this.mockDb.fraudRules;
    }
    updateRule(id, dto, userEmail) {
        const rule = this.mockDb.fraudRules.find((r) => r.id === id || r.ruleCode === id);
        if (!rule) {
            throw new common_1.NotFoundException(`Fraud rule with ID ${id} was not found.`);
        }
        const beforeState = { ...rule };
        if (dto.scoreWeight !== undefined)
            rule.scoreWeight = dto.scoreWeight;
        if (dto.isActive !== undefined)
            rule.isActive = dto.isActive;
        if (dto.criteria)
            rule.criteria = { ...rule.criteria, ...dto.criteria };
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userEmail: userEmail || 'system',
            action: shared_types_1.AuditAction.UPDATE_FRAUD_RULE,
            entityType: 'FraudRule',
            entityId: rule.id,
            ipAddress: '127.0.0.1',
            userAgent: 'Rule Configurator',
            result: 'SUCCESS',
            beforeState: beforeState,
            afterState: rule,
            createdAt: new Date().toISOString(),
        });
        return rule;
    }
};
exports.FraudEngineService = FraudEngineService;
exports.FraudEngineService = FraudEngineService = FraudEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], FraudEngineService);
//# sourceMappingURL=fraud-engine.service.js.map