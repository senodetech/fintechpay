import Decimal from 'decimal.js';
export declare class MoneyMath {
    static add(a: string | number | Decimal, b: string | number | Decimal): Decimal;
    static subtract(a: string | number | Decimal, b: string | number | Decimal): Decimal;
    static multiply(a: string | number | Decimal, factor: string | number | Decimal): Decimal;
    static divide(a: string | number | Decimal, divisor: string | number | Decimal): Decimal;
    static isGreaterThan(a: string | number | Decimal, b: string | number | Decimal): boolean;
    static isGreaterThanOrEqualTo(a: string | number | Decimal, b: string | number | Decimal): boolean;
    static isLessThan(a: string | number | Decimal, b: string | number | Decimal): boolean;
    static isLessThanOrEqualTo(a: string | number | Decimal, b: string | number | Decimal): boolean;
    static isEqual(a: string | number | Decimal, b: string | number | Decimal): boolean;
    static isZero(a: string | number | Decimal): boolean;
    static isPositive(a: string | number | Decimal): boolean;
    static toDbString(amount: string | number | Decimal): string;
    static toDisplayString(amount: string | number | Decimal, decimals?: number): string;
}
