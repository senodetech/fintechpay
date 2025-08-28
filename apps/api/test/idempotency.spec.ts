import { PaymentsService } from '../src/modules/payments/payments.service';
import { FraudEngineService } from '../src/modules/fraud/fraud-engine.service';
import { MockDbService } from '../src/database/mock-db.service';
import { PaymentMethod, Currency } from '@finpay360/shared-types';

describe('Payment Idempotency & Financial Concurrency Verification', () => {
  let paymentsService: PaymentsService;
  let fraudEngine: FraudEngineService;
  let mockDb: MockDbService;

  beforeEach(() => {
    mockDb = new MockDbService();
    fraudEngine = new FraudEngineService(mockDb);
    paymentsService = new PaymentsService(mockDb, fraudEngine);
  });

  it('should process payment request exactly ONCE when same Idempotency-Key is supplied multiple times', async () => {
    const key = `test-idemp-${Date.now()}`;
    const initialPaymentCount = mockDb.payments.length;

    const sourceAcc = mockDb.accounts[0];
    const destAcc = mockDb.accounts[1];

    const payload = {
      idempotencyKey: key,
      customerId: sourceAcc.customerId,
      sourceAccountId: sourceAcc.id,
      destinationAccountId: destAcc.id,
      amount: '250.0000',
      currency: Currency.USD,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
    };

    // First Call
    const payment1 = await paymentsService.createPayment(payload);
    expect(payment1.idempotencyKey).toBe(key);
    expect(mockDb.payments.length).toBe(initialPaymentCount + 1);

    // Duplicate Call with same Idempotency Key
    const payment2 = await paymentsService.createPayment(payload);
    expect(payment2.id).toBe(payment1.id);
    expect(payment2.paymentReference).toBe(payment1.paymentReference);
    // Number of total payments in database must NOT increase
    expect(mockDb.payments.length).toBe(initialPaymentCount + 1);
  });
});
