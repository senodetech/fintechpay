import { Injectable, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import {
  DashboardMetricsDto,
  PaymentStatus,
  PaymentMethod,
  RiskLevel,
  FraudAlertStatus,
  FraudRuleCode,
} from '@finpay360/shared-types';
import { MoneyMath } from '../../common/utils/money-math';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly mockDb: MockDbService) {}

  public getMetrics(range: 'today' | '7d' | '30d' | '90d' = '30d'): DashboardMetricsDto {
    const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const cutoffTime = Date.now() - days * 86400000;

    const filteredPayments = this.mockDb.payments.filter(
      (p) => new Date(p.createdAt).getTime() >= cutoffTime,
    );
    const filteredTxs = this.mockDb.transactions.filter(
      (t) => new Date(t.createdAt).getTime() >= cutoffTime,
    );
    const filteredAlerts = this.mockDb.fraudAlerts.filter(
      (a) => new Date(a.createdAt).getTime() >= cutoffTime,
    );

    // 1. Calculate Aggregate Volume
    let totalVolumeDec = MoneyMath.add(0, 0);
    let totalRefundsDec = MoneyMath.add(0, 0);
    let totalChargebacksDec = MoneyMath.add(0, 0);
    let totalRiskScoreSum = 0;

    let successfulPayments = 0;
    let failedPayments = 0;
    let pendingPayments = 0;
    let refundedCount = 0;
    let chargebackCount = 0;

    for (const p of filteredPayments) {
      if (p.status === PaymentStatus.COMPLETED) {
        totalVolumeDec = MoneyMath.add(totalVolumeDec, p.amount);
        successfulPayments++;
      } else if (p.status === PaymentStatus.FAILED) {
        failedPayments++;
      } else if (p.status === PaymentStatus.PROCESSING || p.status === PaymentStatus.INITIATED) {
        pendingPayments++;
      } else if (p.status === PaymentStatus.REFUNDED) {
        totalRefundsDec = MoneyMath.add(totalRefundsDec, p.amount);
        refundedCount++;
      } else if (p.status === PaymentStatus.CHARGEBACK) {
        totalChargebacksDec = MoneyMath.add(totalChargebacksDec, p.amount);
        chargebackCount++;
      }
      totalRiskScoreSum += p.riskScore || 0;
    }

    const avgRisk = filteredPayments.length > 0
      ? Math.round(totalRiskScoreSum / filteredPayments.length)
      : 18;

    // 2. Generate 14-point Volume Trends for ECharts
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

    // 3. Payment Method Distribution
    const methodCounts: Record<PaymentMethod, { count: number; volume: number }> = {
      [PaymentMethod.CARD]: { count: 0, volume: 0 },
      [PaymentMethod.BANK_TRANSFER]: { count: 0, volume: 0 },
      [PaymentMethod.UPI]: { count: 0, volume: 0 },
      [PaymentMethod.WALLET]: { count: 0, volume: 0 },
      [PaymentMethod.ACH]: { count: 0, volume: 0 },
      [PaymentMethod.SEPA]: { count: 0, volume: 0 },
      [PaymentMethod.WIRE]: { count: 0, volume: 0 },
    };

    for (const p of filteredPayments) {
      if (methodCounts[p.paymentMethod]) {
        methodCounts[p.paymentMethod].count++;
        methodCounts[p.paymentMethod].volume += parseFloat(p.amount);
      }
    }

    const totalMethodCount = filteredPayments.length || 1;
    const paymentMethodDistribution = Object.entries(methodCounts).map(([method, data]) => ({
      method: method as PaymentMethod,
      count: data.count,
      volume: MoneyMath.toDisplayString(data.volume),
      percentage: Math.round((data.count / totalMethodCount) * 100),
    }));

    // 4. Fraud Trends
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

    // 5. Top Risk Rules
    const topRiskRules = [
      {
        ruleCode: FraudRuleCode.RULE_HIGH_VALUE,
        ruleName: 'High Value Transaction Anomaly',
        triggerCount: 38,
        avgScoreContribution: 35,
      },
      {
        ruleCode: FraudRuleCode.RULE_VELOCITY,
        ruleName: 'Rapid Velocity Spikes',
        triggerCount: 24,
        avgScoreContribution: 25,
      },
      {
        ruleCode: FraudRuleCode.RULE_GEO_ANOMALY,
        ruleName: 'Geographic Impossibility',
        triggerCount: 19,
        avgScoreContribution: 40,
      },
      {
        ruleCode: FraudRuleCode.RULE_DEVICE_ANOMALY,
        ruleName: 'Unrecognized Device Fingerprint',
        triggerCount: 15,
        avgScoreContribution: 20,
      },
    ];

    // 6. Geographic Distribution
    const geographicDistribution = [
      { countryCode: 'US', countryName: 'United States', volume: '$12,450,000.00', txCount: 84200, riskScoreAvg: 14 },
      { countryCode: 'GB', countryName: 'United Kingdom', volume: '$5,210,000.00', txCount: 38100, riskScoreAvg: 16 },
      { countryCode: 'DE', countryName: 'Germany', volume: '$3,890,000.00', txCount: 24500, riskScoreAvg: 12 },
      { countryCode: 'IN', countryName: 'India', volume: '$2,140,000.00', txCount: 31200, riskScoreAvg: 19 },
      { countryCode: 'SG', countryName: 'Singapore', volume: '$1,920,000.00', txCount: 15600, riskScoreAvg: 11 },
    ];

    return {
      summary: {
        totalVolume: MoneyMath.toDisplayString(totalVolumeDec),
        totalTransactions: filteredTxs.length || 182432,
        successfulPayments: successfulPayments || 480,
        failedPayments: failedPayments || 18,
        pendingPayments: pendingPayments || 12,
        fraudAlertsCount: filteredAlerts.length || 47,
        totalRefunds: MoneyMath.toDisplayString(totalRefundsDec),
        totalChargebacks: MoneyMath.toDisplayString(totalChargebacksDec),
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
}
