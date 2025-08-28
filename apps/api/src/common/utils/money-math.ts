import Decimal from 'decimal.js';

Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

export class MoneyMath {
  public static add(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return new Decimal(a).plus(new Decimal(b));
  }

  public static subtract(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    return new Decimal(a).minus(new Decimal(b));
  }

  public static multiply(a: string | number | Decimal, factor: string | number | Decimal): Decimal {
    return new Decimal(a).times(new Decimal(factor));
  }

  public static divide(a: string | number | Decimal, divisor: string | number | Decimal): Decimal {
    return new Decimal(a).dividedBy(new Decimal(divisor));
  }

  public static isGreaterThan(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return new Decimal(a).greaterThan(new Decimal(b));
  }

  public static isGreaterThanOrEqualTo(
    a: string | number | Decimal,
    b: string | number | Decimal,
  ): boolean {
    return new Decimal(a).greaterThanOrEqualTo(new Decimal(b));
  }

  public static isLessThan(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return new Decimal(a).lessThan(new Decimal(b));
  }

  public static isLessThanOrEqualTo(
    a: string | number | Decimal,
    b: string | number | Decimal,
  ): boolean {
    return new Decimal(a).lessThanOrEqualTo(new Decimal(b));
  }

  public static isEqual(a: string | number | Decimal, b: string | number | Decimal): boolean {
    return new Decimal(a).equals(new Decimal(b));
  }

  public static isZero(a: string | number | Decimal): boolean {
    return new Decimal(a).isZero();
  }

  public static isPositive(a: string | number | Decimal): boolean {
    return new Decimal(a).isPositive() && !new Decimal(a).isZero();
  }

  public static toDbString(amount: string | number | Decimal): string {
    return new Decimal(amount).toFixed(4);
  }

  public static toDisplayString(amount: string | number | Decimal, decimals: number = 2): string {
    return new Decimal(amount).toFixed(decimals);
  }
}
