export class MaskUtils {
  public static maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '';
    const clean = accountNumber.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    const last4 = clean.slice(-4);
    return `**** **** **** ${last4}`;
  }

  public static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}*@${domain}`;
    }
    const maskedLocal = `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`;
    return `${maskedLocal}@${domain}`;
  }

  public static maskIpAddress(ip: string): string {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
    return ip.slice(0, 8) + '...';
  }
}
