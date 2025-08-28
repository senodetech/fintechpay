import { FraudEngineService } from '../src/modules/fraud/fraud-engine.service';
import { MockDbService } from '../src/database/mock-db.service';
import { PaymentMethod, Currency, RiskLevel } from '@finpay360/shared-types';

describe('FraudEngineService (Composite Risk Rule Evaluation)', () => {
  let fraudEngine: FraudEngineService;
  let mockDb: MockDbService;

  beforeEach(() => {
    mockDb = new MockDbService();
    fraudEngine = new FraudEngineService(mockDb);
  });

  it('should auto-approve low-value payments for standard verified customers', () => {
    const result = fraudEngine.evaluatePayment({
      customerId: 'cust-001',
      sourceAccountId: 'acc-001',
      amount: '45.0000',
      currency: Currency.USD,
      paymentMethod: PaymentMethod.CARD,
    });

    expect(result.riskScore).toBeLessThan(35);
    expect(result.decision).toBe('ALLOW');
  });

  it('should elevate risk score and flag High-Value anomaly rule for $65,000 transaction', () => {
    const result = fraudEngine.evaluatePayment({
      customerId: 'cust-001',
      sourceAccountId: 'acc-001',
      amount: '65000.0000',
      currency: Currency.USD,
      paymentMethod: PaymentMethod.WIRE,
    });

    expect(result.riskScore).toBeGreaterThan(40);
    const hasHighValRule = result.triggeredRules.some((r) => r.ruleCode === 'RULE_HIGH_VALUE');
    expect(hasHighValRule).toBe(true);
  });

  it('should trigger BLOCK decision for critical geo-anomalous payment', () => {
    const result = fraudEngine.evaluatePayment({
      customerId: 'cust-001',
      sourceAccountId: 'acc-001',
      amount: '75000.0000',
      currency: Currency.USD,
      paymentMethod: PaymentMethod.WIRE,
      metadata: { geoAnomalous: true },
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(80);
    expect(result.riskLevel).toBe(RiskLevel.CRITICAL);
    expect(result.decision).toBe('BLOCK');
  });
});
