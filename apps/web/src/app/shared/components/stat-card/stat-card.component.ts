import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fintech-card fintech-card-hover p-5 rounded-xl flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ title }}</span>
        <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800/80 border border-slate-700/60" [ngClass]="iconColor">
          <span class="material-icons-outlined text-lg">{{ icon }}</span>
        </div>
      </div>
      <div class="flex items-baseline justify-between mt-1">
        <span class="text-2xl font-extrabold text-white tracking-tight font-mono">{{ value }}</span>
        <div *ngIf="trend !== undefined" class="flex items-center text-xs font-semibold" [ngClass]="trend >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          <span class="material-icons-outlined text-sm mr-0.5">{{ trend >= 0 ? 'trending_up' : 'trending_down' }}</span>
          <span>{{ trend >= 0 ? '+' : '' }}{{ trend }}%</span>
        </div>
      </div>
      <span *ngIf="subtitle" class="text-xs text-slate-400 mt-2">{{ subtitle }}</span>
    </div>
  `,
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'analytics';
  @Input() iconColor: string = 'text-emerald-400';
  @Input() trend?: number;
  @Input() subtitle?: string;
}
