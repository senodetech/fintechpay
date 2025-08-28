import { Pipe, PipeTransform } from '@angular/core';
import { Currency } from '@finpay360/shared-types';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: string | number | undefined, currency: Currency | string = Currency.USD): string {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';

    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      CAD: 'CA$',
      AUD: 'A$',
      SGD: 'S$',
    };

    const symbol = symbols[currency] || '$';
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  }
}
