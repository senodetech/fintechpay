import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import {
  IFraudAlert,
  IFraudRule,
  IFraudInvestigation,
  FraudFilterDto,
  PaginatedResponse,
  RiskLevel,
  FraudAlertStatus,
  FraudRuleCode,
  InvestigateFraudAlertDto,
  UpdateFraudRuleDto,
  AuditAction,
  PaymentMethod,
  Currency,
} from '@finpay360/shared-types';
import { MoneyMath } from '../../common/utils/money-math';

export interface FraudEvaluationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  decision: 'ALLOW' | 'CHALLENGE' | 'REVIEW' | 'BLOCK';
  triggeredRules: Array<{
    ruleCode: string;
    ruleName: string;
    score: number;
    details: string;
  }>;
}

@Injectable()
export class FraudEngineService {
  private readonly logger = new Logger(FraudEngineService.name);

  constructor(private readonly mockDb: MockDbService) {}

  public evaluatePayment(params: {
    customerId: string;
    sourceAccountId: string;
    amount: string;
    currency: Currency;
    paymentMethod: PaymentMethod;
    metadata?: Record<string, any>;
  }): FraudEvaluationResult {
    const customer = this.mockDb.customers.find((c) => c.id === params.customerId);
    const triggeredRules: FraudEvaluationResult['triggeredRules'] = [];
    let cumulativeScore = customer ? Math.floor(customer.riskScore * 0.2) : 5;

    const amountNum = parseFloat(params.amount);

    // Rule 1: High-Value Anomaly
    const highValRule = this.mockDb.fraudRules.find((r) => r.ruleCode === FraudRuleCode.RULE_HIGH_VALUE && r.isActive);
    if (highValRule && amountNum >= 10000) {
      const score = amountNum > 50000 ? 40 : 25;
      cumulativeScore += score;
      triggeredRules.push({
        ruleCode: highValRule.ruleCode,
        ruleName: highValRule.name,
        score,
        details: `Amount of $${MoneyMath.toDisplayString(amountNum)} exceeded threshold ($10,000.00).`,
      });
    }

    // Rule 2: Velocity Check (Recent payments in last 10 minutes)
    const velocityRule = this.mockDb.fraudRules.find((r) => r.ruleCode === FraudRuleCode.RULE_VELOCITY && r.isActive);
    const tenMinsAgo = Date.now() - 10 * 60000;
    const recentTxCount = this.mockDb.payments.filter(
      (p) => p.customerId === params.customerId && new Date(p.createdAt).getTime() > tenMinsAgo,
    ).length;

    if (velocityRule && recentTxCount >= 3) {
      cumulativeScore += velocityRule.scoreWeight;
      triggeredRules.push({
        ruleCode: velocityRule.ruleCode,
        ruleName: velocityRule.name,
        score: velocityRule.scoreWeight,
        details: `High transaction frequency: ${recentTxCount + 1} payment requests detected within 10 minutes.`,
      });
    }

    // Rule 3: Geo-Anomaly (Simulated IP location check)
    const geoRule = this.mockDb.fraudRules.find((r) => r.ruleCode === FraudRuleCode.RULE_GEO_ANOMALY && r.isActive);
    if (geoRule && params.metadata?.geoAnomalous) {
      cumulativeScore += geoRule.scoreWeight;
      triggeredRules.push({
        ruleCode: geoRule.ruleCode,
        ruleName: geoRule.name,
        score: geoRule.scoreWeight,
        details: 'Geographic distance impossible within elapsed travel time window.',
      });
    }

    // Rule 4: High-Risk Country
    const countryRule = this.mockDb.fraudRules.find((r) => r.ruleCode === FraudRuleCode.RULE_HIGH_RISK_COUNTRY && r.isActive);
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

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, cumulativeScore));

    let riskLevel = RiskLevel.LOW;
    let decision: FraudEvaluationResult['decision'] = 'ALLOW';

    if (finalScore >= 81) {
      riskLevel = RiskLevel.CRITICAL;
      decision = 'BLOCK';
    } else if (finalScore >= 61) {
      riskLevel = RiskLevel.HIGH;
      decision = 'REVIEW';
    } else if (finalScore >= 31) {
      riskLevel = RiskLevel.MEDIUM;
      decision = 'CHALLENGE';
    }

    return {
      riskScore: finalScore,
      riskLevel,
      decision,
      triggeredRules,
    };
  }

  public getAlerts(filter: FraudFilterDto): PaginatedResponse<IFraudAlert> {
    let items = [...this.mockDb.fraudAlerts];

    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.alertReference.toLowerCase().includes(s) ||
          (a.paymentReference && a.paymentReference.toLowerCase().includes(s)) ||
          (a.customerName && a.customerName.toLowerCase().includes(s)),
      );
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

  public getAlertById(id: string): {
    alert: IFraudAlert;
    customer?: any;
    payment?: any;
  } {
    const alert = this.mockDb.fraudAlerts.find((a) => a.id === id || a.alertReference === id);
    if (!alert) {
      throw new NotFoundException(`Fraud alert with ID ${id} was not found.`);
    }

    const customer = this.mockDb.customers.find((c) => c.id === alert.customerId);
    const payment = this.mockDb.payments.find((p) => p.id === alert.paymentId);

    return {
      alert,
      customer,
      payment,
    };
  }

  public investigateAlert(
    id: string,
    dto: InvestigateFraudAlertDto,
    analystName: string = 'Security Analyst',
    analystEmail: string = 'risk@finpay360.io',
  ): IFraudAlert {
    const alert = this.mockDb.fraudAlerts.find((a) => a.id === id || a.alertReference === id);
    if (!alert) {
      throw new NotFoundException(`Fraud alert with ID ${id} was not found.`);
    }

    const beforeState = { status: alert.status };
    alert.status = dto.decision;
    alert.updatedAt = new Date().toISOString();

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: analystEmail,
      action: AuditAction.RESOLVE_FRAUD_ALERT,
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

  public getRules(): IFraudRule[] {
    return this.mockDb.fraudRules;
  }

  public updateRule(id: string, dto: UpdateFraudRuleDto, userEmail?: string): IFraudRule {
    const rule = this.mockDb.fraudRules.find((r) => r.id === id || r.ruleCode === id);
    if (!rule) {
      throw new NotFoundException(`Fraud rule with ID ${id} was not found.`);
    }

    const beforeState = { ...rule };
    if (dto.scoreWeight !== undefined) rule.scoreWeight = dto.scoreWeight;
    if (dto.isActive !== undefined) rule.isActive = dto.isActive;
    if (dto.criteria) rule.criteria = { ...rule.criteria, ...dto.criteria };

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.UPDATE_FRAUD_RULE,
      entityType: 'FraudRule',
      entityId: rule.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Rule Configurator',
      result: 'SUCCESS',
      beforeState: beforeState as any,
      afterState: rule as any,
      createdAt: new Date().toISOString(),
    });

    return rule;
  }
}
