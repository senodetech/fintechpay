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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("../../database/mock-db.service");
const shared_types_1 = require("@finpay360/shared-types");
const money_math_1 = require("../../common/utils/money-math");
let DashboardService = DashboardService_1 = class DashboardService {
    mockDb;
    logger = new common_1.Logger(DashboardService_1.name);
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    getMetrics(range = '30d') {
        const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const cutoffTime = Date.now() - days * 86400000;
        const filteredPayments = this.mockDb.payments.filter((p) => new Date(p.createdAt).getTime() >= cutoffTime);
        const filteredTxs = this.mockDb.transactions.filter((t) => new Date(t.createdAt).getTime() >= cutoffTime);
        const filteredAlerts = this.mockDb.fraudAlerts.filter((a) => new Date(a.createdAt).getTime() >= cutoffTime);
        let totalVolumeDec = money_math_1.MoneyMath.add(0, 0);
        let totalRefundsDec = money_math_1.MoneyMath.add(0, 0);
        let totalChargebacksDec = money_math_1.MoneyMath.add(0, 0);
        let totalRiskScoreSum = 0;
        let successfulPayments = 0;
        let failedPayments = 0;
        let pendingPayments = 0;
        let refundedCount = 0;
        let chargebackCount = 0;
        for (const p of filteredPayments) {
            if (p.status === shared_types_1.PaymentStatus.COMPLETED) {
                totalVolumeDec = money_math_1.MoneyMath.add(totalVolumeDec, p.amount);
                successfulPayments++;
            }
            else if (p.status === shared_types_1.PaymentStatus.FAILED) {
                failedPayments++;
            }
            else if (p.status === shared_types_1.PaymentStatus.PROCESSING || p.status === shared_types_1.PaymentStatus.INITIATED) {
                pendingPayments++;
            }
            else if (p.status === shared_types_1.PaymentStatus.REFUNDED) {
                totalRefundsDec = money_math_1.MoneyMath.add(totalRefundsDec, p.amount);
                refundedCount++;
            }
            else if (p.status === shared_types_1.PaymentStatus.CHARGEBACK) {
                totalChargebacksDec = money_math_1.MoneyMath.add(totalChargebacksDec, p.amount);
                chargebackCount++;
            }
            totalRiskScoreSum += p.riskScore || 0;
        }
        const avgRisk = filteredPayments.length > 0
            ? Math.round(totalRiskScoreSum / filteredPayments.length)
            : 18;
        const volumeTrends = [];
        const trendBuckets = Math.min(14, days === 1 ? 12 : days);
        const bucketInterval = (days * 86400000) / trendBuckets;
        for (let i = trendBuckets - 1; i >= 0; i--) {
            const bucketStart = Date.now() - (i + 1) * bucketInterval;
            const bucketEnd = Date.now() - i * bucketInterval;
            const bucketTxs = filteredTxs.filter((t) => {
                const time = new Date(t.createdAt).getTime();
                return time >= bucketStart && time < bucketEnd;
            });
            let bucketVol = 0;
            for (const t of bucketTxs) {
                bucketVol += parseFloat(t.amount);
            }
            volumeTrends.push({
                timestamp: new Date(bucketEnd).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                volume: Math.round(bucketVol + 45000 + Math.sin(i) * 15000),
                count: bucketTxs.length + 120,
                successRate: 98.4 - (i % 3) * 0.4,
            });
        }
        const methodCounts = {
            [shared_types_1.PaymentMethod.CARD]: { count: 0, volume: 0 },
            [shared_types_1.PaymentMethod.BANK_TRANSFER]: { count: 0, volume: 0 },
            [shared_types_1.PaymentMethod.UPI]: { count: 0, volume: 0 },
            [shared_types_1.PaymentMethod.WALLET]: { count: 0, volume: 0 },
            [shared_types_1.PaymentMethod.ACH]: { count: 0, volume: 0 },
            [shared_types_1.PaymentMethod.SEPA]: { count: 0, volume: 0 },
            [shared_types_1.PaymentMethod.WIRE]: { count: 0, volume: 0 },
        };
        for (const p of filteredPayments) {
            if (methodCounts[p.paymentMethod]) {
                methodCounts[p.paymentMethod].count++;
                methodCounts[p.paymentMethod].volume += parseFloat(p.amount);
            }
        }
        const totalMethodCount = filteredPayments.length || 1;
        const paymentMethodDistribution = Object.entries(methodCounts).map(([method, data]) => ({
            method: method,
            count: data.count,
            volume: money_math_1.MoneyMath.toDisplayString(data.volume),
            percentage: Math.round((data.count / totalMethodCount) * 100),
        }));
        const fraudTrends = [];
        for (let d = 6; d >= 0; d--) {
            const dayDate = new Date(Date.now() - d * 86400000).toISOString().split('T')[0];
            fraudTrends.push({
                date: dayDate,
                criticalAlerts: 2 + (d % 3),
                highAlerts: 5 + ((d * 2) % 4),
                mediumAlerts: 8 + (d % 5),
                resolvedCount: 12 + d,
            });
        }
        const topRiskRules = [
            {
                ruleCode: shared_types_1.FraudRuleCode.RULE_HIGH_VALUE,
                ruleName: 'High Value Transaction Anomaly',
                triggerCount: 38,
                avgScoreContribution: 35,
            },
            {
                ruleCode: shared_types_1.FraudRuleCode.RULE_VELOCITY,
                ruleName: 'Rapid Velocity Spikes',
                triggerCount: 24,
                avgScoreContribution: 25,
            },
            {
                ruleCode: shared_types_1.FraudRuleCode.RULE_GEO_ANOMALY,
                ruleName: 'Geographic Impossibility',
                triggerCount: 19,
                avgScoreContribution: 40,
            },
            {
                ruleCode: shared_types_1.FraudRuleCode.RULE_DEVICE_ANOMALY,
                ruleName: 'Unrecognized Device Fingerprint',
                triggerCount: 15,
                avgScoreContribution: 20,
            },
        ];
        const geographicDistribution = [
            { countryCode: 'US', countryName: 'United States', volume: '$12,450,000.00', txCount: 84200, riskScoreAvg: 14 },
            { countryCode: 'GB', countryName: 'United Kingdom', volume: '$5,210,000.00', txCount: 38100, riskScoreAvg: 16 },
            { countryCode: 'DE', countryName: 'Germany', volume: '$3,890,000.00', txCount: 24500, riskScoreAvg: 12 },
            { countryCode: 'IN', countryName: 'India', volume: '$2,140,000.00', txCount: 31200, riskScoreAvg: 19 },
            { countryCode: 'SG', countryName: 'Singapore', volume: '$1,920,000.00', txCount: 15600, riskScoreAvg: 11 },
        ];
        return {
            summary: {
                totalVolume: money_math_1.MoneyMath.toDisplayString(totalVolumeDec),
                totalTransactions: filteredTxs.length || 182432,
                successfulPayments: successfulPayments || 480,
                failedPayments: failedPayments || 18,
                pendingPayments: pendingPayments || 12,
                fraudAlertsCount: filteredAlerts.length || 47,
                totalRefunds: money_math_1.MoneyMath.toDisplayString(totalRefundsDec),
                totalChargebacks: money_math_1.MoneyMath.toDisplayString(totalChargebacksDec),
                averageRiskScore: avgRisk,
                volumeGrowthPct: 12.4,
                txCountGrowthPct: 8.2,
                fraudReductionPct: -14.3,
            },
            volumeTrends,
            paymentSuccessBreakdown: {
                completed: successfulPayments || 480,
                failed: failedPayments || 18,
                pending: pendingPayments || 12,
                refunded: refundedCount || 10,
                chargeback: chargebackCount || 2,
            },
            paymentMethodDistribution,
            fraudTrends,
            topRiskRules,
            geographicDistribution,
            recentTransactions: this.mockDb.transactions.slice(0, 6),
            liveFraudAlerts: this.mockDb.fraudAlerts.slice(0, 5),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map