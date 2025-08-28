import { MoneyMath } from '../src/common/utils/money-math';

describe('MoneyMath Utility (High Precision Financial Math)', () => {
  it('should avoid JavaScript float arithmetic rounding errors (0.1 + 0.2 === 0.3000)', () => {
    const floatResult = 0.1 + 0.2; // 0.30000000000000004 in JS
    expect(floatResult).not.toBe(0.3);

    const exactResult = MoneyMath.add('0.1', '0.2');
    expect(exactResult.toString()).toBe('0.3');
    expect(MoneyMath.toDbString(exactResult)).toBe('0.3000');
  });

  it('should accurately subtract large financial balances', () => {
    const balance = '1500000.7550';
    const debit = '450000.2500';
    const remaining = MoneyMath.subtract(balance, debit);
    expect(MoneyMath.toDbString(remaining)).toBe('1050000.5050');
  });

  it('should accurately check balance sufficiency', () => {
    expect(MoneyMath.isGreaterThanOrEqualTo('100.0000', '99.9999')).toBe(true);
    expect(MoneyMath.isGreaterThanOrEqualTo('100.0000', '100.0000')).toBe(true);
    expect(MoneyMath.isGreaterThanOrEqualTo('99.9999', '100.0000')).toBe(false);
  });

  it('should format money to 2 decimal places display strings', () => {
    expect(MoneyMath.toDisplayString('12450.5000')).toBe('12450.50');
    expect(MoneyMath.toDisplayString(45.9)).toBe('45.90');
  });
});
