import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'riskScoreBadge',
  standalone: true,
})
export class RiskScorePipe implements PipeTransform {
  transform(score: number | undefined): { label: string; bgClass: string; textClass: string } {
    const s = score || 0;
    if (s >= 81) {
      return { label: 'CRITICAL', bgClass: 'bg-rose-500/10 border-rose-500/30', textClass: 'text-rose-400' };
    }
    if (s >= 61) {
      return { label: 'HIGH', bgClass: 'bg-amber-500/10 border-amber-500/30', textClass: 'text-amber-400' };
    }
    if (s >= 31) {
      return { label: 'MEDIUM', bgClass: 'bg-yellow-500/10 border-yellow-500/30', textClass: 'text-yellow-400' };
    }
    return { label: 'LOW', bgClass: 'bg-emerald-500/10 border-emerald-500/30', textClass: 'text-emerald-400' };
  }
}
