import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      [ngClass]="getBadgeClass()"
    >
      <span class="w-1.5 h-1.5 rounded-full mr-1.5" [ngClass]="getDotClass()"></span>
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status: string = 'ACTIVE';

  getBadgeClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'ACTIVE':
      case 'RESOLVED':
      case 'SUCCESS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PROCESSING':
      case 'INITIATED':
      case 'PENDING':
      case 'INVESTIGATING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FAILED':
      case 'REJECTED':
      case 'FROZEN':
      case 'SUSPENDED':
      case 'CONFIRMED':
      case 'CRITICAL':
      case 'CHARGEBACK':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'REFUNDED':
      case 'CANCELLED':
      case 'FALSE_POSITIVE':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  }

  getDotClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'ACTIVE':
      case 'RESOLVED':
      case 'SUCCESS':
        return 'bg-emerald-400';
      case 'PROCESSING':
      case 'INITIATED':
      case 'PENDING':
      case 'INVESTIGATING':
        return 'bg-amber-400';
      case 'FAILED':
      case 'REJECTED':
      case 'FROZEN':
      case 'SUSPENDED':
      case 'CONFIRMED':
      case 'CRITICAL':
      case 'CHARGEBACK':
        return 'bg-rose-400';
      default:
        return 'bg-slate-400';
    }
  }
}
