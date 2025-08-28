import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { MaskAccountPipe } from '../../shared/pipes/mask-account.pipe';
import { DashboardMetricsDto, ITransaction, IFraudAlert } from '@finpay360/shared-types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    StatusBadgeComponent,
    CurrencyFormatPipe,
    MaskAccountPipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Time Range Filter -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">FinTech Operations Dashboard</h1>
          <p class="text-xs text-slate-400 mt-1">Real-time payment settlements, multi-rail liquidity, and risk monitoring</p>
        </div>

        <!-- Range Buttons -->
        <div class="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            *ngFor="let r of ranges"
            (click)="selectRange(r.value)"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            [ngClass]="selectedRange() === r.value ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            {{ r.label }}
          </button>
        </div>
      </div>

      <!-- Real-time Live Alert Banner (When critical alert arrives) -->
      <div *ngIf="latestAlert()" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between animate-fade-in">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <span class="material-icons text-base">warning</span>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold text-rose-300">REAL-TIME FRAUD ALERT</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">Score: {{ latestAlert()?.riskScore }}</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">
              Payment <strong>{{ latestAlert()?.paymentReference }}</strong> for <strong>{{ latestAlert()?.amount | currencyFormat:latestAlert()?.currency }}</strong> flagged by risk engine.
            </p>
          </div>
        </div>
        <a routerLink="/fraud" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition">
          Investigate Alert
        </a>
      </div>

      <!-- 8 Key Performance Indicator Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="metrics()">
        <app-stat-card
          title="Total Processed Volume"
          [value]="metrics()!.summary.totalVolume | currencyFormat"
          [trend]="metrics()!.summary.volumeGrowthPct"
          icon="payments"
          iconColor="text-emerald-400"
          subtitle="Multi-currency gross settlement"
        ></app-stat-card>

        <app-stat-card
          title="Transaction Count"
          [value]="(metrics()!.summary.totalTransactions | number) || '0'"
          [trend]="metrics()!.summary.txCountGrowthPct"
          icon="receipt_long"
          iconColor="text-teal-400"
          subtitle="Processed ledger journal entries"
        ></app-stat-card>

        <app-stat-card
          title="Payment Success Rate"
          value="98.6%"
          [trend]="0.8"
          icon="verified"
          iconColor="text-emerald-400"
          [subtitle]="metrics()!.summary.successfulPayments + ' successful / ' + metrics()!.summary.failedPayments + ' failed'"
        ></app-stat-card>

        <app-stat-card
          title="Active Fraud Alerts"
          [value]="metrics()!.summary.fraudAlertsCount"
          [trend]="metrics()!.summary.fraudReductionPct"
          icon="security"
          iconColor="text-rose-400"
          [subtitle]="'Average risk score: ' + metrics()!.summary.averageRiskScore + ' / 100'"
        ></app-stat-card>
      </div>

      <!-- 4 Secondary Metrics Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" *ngIf="metrics()">
        <div class="fintech-card p-4 rounded-xl">
          <span class="text-[11px] font-semibold text-slate-400 uppercase">Settled Payments</span>
          <p class="text-xl font-bold font-mono text-emerald-400 mt-1">{{ metrics()!.summary.successfulPayments }}</p>
        </div>
        <div class="fintech-card p-4 rounded-xl">
          <span class="text-[11px] font-semibold text-slate-400 uppercase">Pending Review</span>
          <p class="text-xl font-bold font-mono text-amber-400 mt-1">{{ metrics()!.summary.pendingPayments }}</p>
        </div>
        <div class="fintech-card p-4 rounded-xl">
          <span class="text-[11px] font-semibold text-slate-400 uppercase">Total Refunds</span>
          <p class="text-xl font-bold font-mono text-slate-300 mt-1">{{ metrics()!.summary.totalRefunds | currencyFormat }}</p>
        </div>
        <div class="fintech-card p-4 rounded-xl">
          <span class="text-[11px] font-semibold text-slate-400 uppercase">Chargebacks</span>
          <p class="text-xl font-bold font-mono text-rose-400 mt-1">{{ metrics()!.summary.totalChargebacks | currencyFormat }}</p>
        </div>
      </div>

      <!-- Visual Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" *ngIf="metrics()">
        <!-- Volume Trend Chart Box -->
        <div class="fintech-card p-5 rounded-2xl lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-bold text-white">Daily Volume & Settlement Velocity</h2>
              <p class="text-xs text-slate-400">14-day aggregated volume trends</p>
            </div>
            <span class="text-xs font-mono text-emerald-400 font-semibold">+12.4% vs prev cycle</span>
          </div>

          <!-- HTML5 / CSS Bar Chart Visualization -->
          <div class="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
            <div *ngFor="let p of metrics()!.volumeTrends" class="flex-1 flex flex-col items-center group relative">
              <!-- Tooltip on hover -->
              <div class="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] text-white z-20 whitespace-nowrap shadow-xl">
                <span>{{ p.timestamp }}</span>
                <span class="font-bold text-emerald-400">\${{ p.volume | number }}</span>
              </div>
              <div
                class="w-full bg-gradient-to-t from-emerald-600/60 to-emerald-400 rounded-t transition-all group-hover:from-emerald-500 group-hover:to-teal-300"
                [style.height.%]="(p.volume / 80000) * 100"
              ></div>
              <span class="text-[9px] text-slate-400 mt-2 rotate-45 md:rotate-0">{{ p.timestamp.slice(0, 3) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Methods Distribution -->
        <div class="fintech-card p-5 rounded-2xl">
          <h2 class="text-sm font-bold text-white mb-1">Payment Method Rails</h2>
          <p class="text-xs text-slate-400 mb-4">Multi-rail distribution by volume</p>

          <div class="space-y-3">
            <div *ngFor="let m of metrics()!.paymentMethodDistribution">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-semibold text-slate-300">{{ m.method }}</span>
                <span class="font-mono text-slate-400">\${{ m.volume }} ({{ m.percentage }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="m.percentage"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Stream Feed & Geographic Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" *ngIf="metrics()">
        <!-- Live Incoming Transactions Feed (WebSockets) -->
        <div class="fintech-card p-5 rounded-2xl lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-emerald"></span>
              <h2 class="text-sm font-bold text-white">Live Transaction Ledger Feed</h2>
            </div>
            <a routerLink="/transactions" class="text-xs text-emerald-400 hover:underline">View All Ledger</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="pb-2 font-semibold">Reference</th>
                  <th class="pb-2 font-semibold">Account</th>
                  <th class="pb-2 font-semibold">Amount</th>
                  <th class="pb-2 font-semibold">Type</th>
                  <th class="pb-2 font-semibold">Status</th>
                  <th class="pb-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-mono">
                <tr *ngFor="let tx of liveTransactions()" class="hover:bg-slate-900/60 transition">
                  <td class="py-2.5 font-bold text-slate-200">{{ tx.transactionReference }}</td>
                  <td class="py-2.5 text-slate-400">{{ tx.accountNumber || (tx.accountId | maskAccount) }}</td>
                  <td class="py-2.5 font-bold" [ngClass]="tx.direction === 'INBOUND' ? 'text-emerald-400' : 'text-slate-200'">
                    {{ tx.direction === 'INBOUND' ? '+' : '-' }}{{ tx.amount | currencyFormat:tx.currency }}
                  </td>
                  <td class="py-2.5 font-sans text-[11px] text-slate-300">{{ tx.type }}</td>
                  <td class="py-2.5 font-sans"><app-status-badge [status]="tx.status"></app-status-badge></td>
                  <td class="py-2.5 text-[11px] text-slate-400">{{ tx.createdAt | date:'shortTime' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Geographic Liquidity Distribution -->
        <div class="fintech-card p-5 rounded-2xl">
          <h2 class="text-sm font-bold text-white mb-1">Geographic Volume</h2>
          <p class="text-xs text-slate-400 mb-4">Regional cross-border corridors</p>

          <div class="space-y-3">
            <div *ngFor="let geo of metrics()!.geographicDistribution" class="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="px-2 py-1 rounded bg-slate-800 text-[11px] font-bold text-emerald-400 font-mono">{{ geo.countryCode }}</span>
                <div>
                  <div class="text-xs font-semibold text-slate-200">{{ geo.countryName }}</div>
                  <div class="text-[10px] text-slate-400">{{ geo.txCount | number }} transactions</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-white font-mono">{{ geo.volume }}</div>
                <div class="text-[10px] text-emerald-400 font-semibold">Risk: {{ geo.riskScoreAvg }}/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private realtime = inject(RealtimeService);

  public selectedRange = signal<'today' | '7d' | '30d' | '90d'>('30d');
  public metrics = signal<DashboardMetricsDto | null>(null);
  public liveTransactions = signal<ITransaction[]>([]);
  public latestAlert = signal<IFraudAlert | null>(null);

  public ranges = [
    { label: 'Today', value: 'today' as const },
    { label: '7 Days', value: '7d' as const },
    { label: '30 Days', value: '30d' as const },
    { label: '90 Days', value: '90d' as const },
  ];

  private txSub?: Subscription;
  private alertSub?: Subscription;

  ngOnInit() {
    this.loadMetrics();

    // Subscribe to WebSocket live events
    this.txSub = this.realtime.onTransaction$.subscribe((tx) => {
      this.liveTransactions.update((list) => [tx, ...list.slice(0, 7)]);
    });

    this.alertSub = this.realtime.onFraudAlert$.subscribe((alert) => {
      this.latestAlert.set(alert);
    });
  }

  ngOnDestroy() {
    this.txSub?.unsubscribe();
    this.alertSub?.unsubscribe();
  }

  selectRange(range: 'today' | '7d' | '30d' | '90d') {
    this.selectedRange.set(range);
    this.loadMetrics();
  }

  loadMetrics() {
    this.api.getDashboardMetrics(this.selectedRange()).subscribe((res) => {
      if (res.success && res.data) {
        this.metrics.set(res.data);
        this.liveTransactions.set(res.data.recentTransactions);
      }
    });
  }
}
