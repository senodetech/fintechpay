"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyMath = void 0;
const decimal_js_1 = require("decimal.js");
decimal_js_1.default.set({
    precision: 28,
    rounding: decimal_js_1.default.ROUND_HALF_UP,
    toExpNeg: -7,
    toExpPos: 21,
});
class MoneyMath {
    static add(a, b) {
        return new decimal_js_1.default(a).plus(new decimal_js_1.default(b));
    }
    static subtract(a, b) {
        return new decimal_js_1.default(a).minus(new decimal_js_1.default(b));
    }
    static multiply(a, factor) {
        return new decimal_js_1.default(a).times(new decimal_js_1.default(factor));
    }
    static divide(a, divisor) {
        return new decimal_js_1.default(a).dividedBy(new decimal_js_1.default(divisor));
    }
    static isGreaterThan(a, b) {
        return new decimal_js_1.default(a).greaterThan(new decimal_js_1.default(b));
    }
    static isGreaterThanOrEqualTo(a, b) {
        return new decimal_js_1.default(a).greaterThanOrEqualTo(new decimal_js_1.default(b));
    }
    static isLessThan(a, b) {
        return new decimal_js_1.default(a).lessThan(new decimal_js_1.default(b));
    }
    static isLessThanOrEqualTo(a, b) {
        return new decimal_js_1.default(a).lessThanOrEqualTo(new decimal_js_1.default(b));
    }
    static isEqual(a, b) {
        return new decimal_js_1.default(a).equals(new decimal_js_1.default(b));
    }
    static isZero(a) {
        return new decimal_js_1.default(a).isZero();
    }
    static isPositive(a) {
        return new decimal_js_1.default(a).isPositive() && !new decimal_js_1.default(a).isZero();
    }
    static toDbString(amount) {
        return new decimal_js_1.default(amount).toFixed(4);
    }
    static toDisplayString(amount, decimals = 2) {
        return new decimal_js_1.default(amount).toFixed(decimals);
    }
}
exports.MoneyMath = MoneyMath;
//# sourceMappingURL=money-math.js.map