import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskAccount',
  standalone: true,
})
export class MaskAccountPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';
    const clean = value.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    const last4 = clean.slice(-4);
    return `**** **** **** ${last4}`;
  }
}
