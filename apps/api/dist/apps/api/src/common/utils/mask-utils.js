"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaskUtils = void 0;
class MaskUtils {
    static maskAccountNumber(accountNumber) {
        if (!accountNumber)
            return '';
        const clean = accountNumber.replace(/\s+/g, '');
        if (clean.length <= 4)
            return clean;
        const last4 = clean.slice(-4);
        return `**** **** **** ${last4}`;
    }
    static maskEmail(email) {
        if (!email || !email.includes('@'))
            return email;
        const [local, domain] = email.split('@');
        if (local.length <= 2) {
            return `${local[0]}*@${domain}`;
        }
        const maskedLocal = `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`;
        return `${maskedLocal}@${domain}`;
    }
    static maskIpAddress(ip) {
        if (!ip)
            return '';
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.***.***`;
        }
        return ip.slice(0, 8) + '...';
    }
}
exports.MaskUtils = MaskUtils;
//# sourceMappingURL=mask-utils.js.map