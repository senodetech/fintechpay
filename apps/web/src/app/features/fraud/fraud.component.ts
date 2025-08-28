import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { RiskScorePipe } from '../../shared/pipes/risk-score.pipe';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import {
  IFraudAlert,
  IFraudRule,
  FraudAlertStatus,
  RiskLevel,
  FraudRuleCode,
} from '@finpay360/shared-types';

@Component({
  selector: 'app-fraud',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    RiskScorePipe,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Fraud Detection & Risk Engine</h1>
          <p class="text-xs text-slate-400 mt-1">Composite anomaly detection, rule weight tuning, and security analyst workbench</p>
        </div>
      </div>

      <!-- Fraud Alerts Queue Section -->
      <div class="fintech-card rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px] relative">
            <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Search by alert ID, payment reference, or customer..."
              class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <select
            [(ngModel)]="selectedStatus"
            (change)="loadAlerts()"
            class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Alert Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="CONFIRMED">CONFIRMED FRAUD</option>
            <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            [(ngModel)]="selectedLevel"
            (change)="loadAlerts()"
            class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">CRITICAL (81-100)</option>
            <option value="HIGH">HIGH (61-80)</option>
            <option value="MEDIUM">MEDIUM (31-60)</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Alert Reference</th>
                <th class="p-4">Payment Ref</th>
                <th class="p-4">Customer</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Risk Score</th>
                <th class="p-4">Triggered Rules</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let a of alerts()" class="hover:bg-slate-900/60 transition font-sans">
                <td class="p-4 font-mono font-bold text-slate-200">{{ a.alertReference }}</td>
                <td class="p-4 font-mono text-emerald-400 font-bold">{{ a.paymentReference }}</td>
                <td class="p-4 font-semibold text-white">{{ a.customerName }}</td>
                <td class="p-4 font-mono font-bold">{{ a.amount | currencyFormat:a.currency }}</td>
                <td class="p-4">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-mono font-bold">{{ a.riskScore }}</span>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-bold border" [ngClass]="(a.riskScore | riskScoreBadge).bgClass + ' ' + (a.riskScore | riskScoreBadge).textClass">
                      {{ (a.riskScore | riskScoreBadge).label }}
                    </span>
                  </div>
                </td>
                <td class="p-4 font-sans text-slate-300">
                  <span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                    {{ a.triggers.length }} rules triggered
                  </span>
                </td>
                <td class="p-4"><app-status-badge [status]="a.status"></app-status-badge></td>
                <td class="p-4 text-right">
                  <button
                    (click)="openInvestigation(a.id)"
                    class="px-3 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {{ page() }} of {{ totalPages() }} ({{ totalCount() }} alerts)</span>
          <div class="flex space-x-2">
            <button (click)="changePage(page() - 1)" [disabled]="page() <= 1" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Previous</button>
            <button (click)="changePage(page() + 1)" [disabled]="page() >= totalPages()" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Next</button>
          </div>
        </div>
      </div>

      <!-- Active Risk Rules Engine Configuration -->
      <div class="fintech-card p-6 rounded-2xl">
        <h2 class="text-sm font-bold text-white mb-1">Active Anomaly Detection Rules</h2>
        <p class="text-xs text-slate-400 mb-4">Configurable weight scoring engine evaluated on each payment initiation</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let r of rules()" class="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-white">{{ r.name }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" [ngClass]="r.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'">
                  {{ r.isActive ? 'ACTIVE' : 'DISABLED' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">{{ r.description }}</p>
              <div class="mt-2 text-xs text-slate-300">
                <span>Score Weight Contribution: </span>
                <strong class="text-emerald-400 font-mono">+{{ r.scoreWeight }} pts</strong>
              </div>
            </div>
            <button (click)="toggleRuleActive(r)" class="text-xs text-slate-400 hover:text-emerald-400 font-semibold">
              {{ r.isActive ? 'Disable' : 'Enable' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Investigation Dossier Modal -->
      <div *ngIf="selectedAlertDossier()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="fintech-card bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 class="text-base font-bold text-white font-mono">{{ selectedAlertDossier()?.alert?.alertReference }}</h3>
              <p class="text-xs text-slate-400">Payment: {{ selectedAlertDossier()?.alert?.paymentReference }}</p>
            </div>
            <button (click)="selectedAlertDossier.set(null)" class="text-slate-400 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <!-- Triggered Anomaly Rules -->
          <div>
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Triggered Rule Signals</h4>
            <div class="space-y-2">
              <div *ngFor="let t of selectedAlertDossier()?.alert?.triggers" class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between">
                <div>
                  <span class="text-xs font-bold text-rose-400">{{ t.ruleName }}</span>
                  <p class="text-[11px] text-slate-300 mt-0.5">{{ t.details }}</p>
                </div>
                <span class="text-xs font-mono font-bold text-rose-400">+{{ t.score }} pts</span>
              </div>
            </div>
          </div>

          <!-- Investigation Decision -->
          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">Analyst Determination</h4>
            <textarea
              [(ngModel)]="investigationNotes"
              placeholder="Enter investigation rationale, device logs review, or customer outreach verification notes..."
              rows="3"
              class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            ></textarea>
            <div class="flex items-center justify-end space-x-2">
              <button
                (click)="submitDecision('FALSE_POSITIVE')"
                class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg"
              >
                Mark False Positive
              </button>
              <button
                (click)="submitDecision('CONFIRMED')"
                class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
              >
                Confirm Fraud & Block
              </button>
              <button
                (click)="submitDecision('RESOLVED')"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
              >
                Resolve & Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FraudComponent implements OnInit {
  private api = inject(ApiService);

  public alerts = signal<IFraudAlert[]>([]);
  public rules = signal<IFraudRule[]>([]);
  public page = signal(1);
  public totalPages = signal(1);
  public totalCount = signal(0);

  public searchQuery = '';
  public selectedStatus = '';
  public selectedLevel = '';

  public selectedAlertDossier = signal<any>(null);
  public investigationNotes = '';

  ngOnInit() {
    this.loadAlerts();
    this.loadRules();
  }

  loadAlerts() {
    this.api
      .getFraudAlerts({
        page: this.page(),
        limit: 10,
        search: this.searchQuery,
        status: (this.selectedStatus as FraudAlertStatus) || undefined,
        riskLevel: (this.selectedLevel as RiskLevel) || undefined,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.alerts.set(res.data.items);
          this.totalPages.set(res.data.totalPages);
          this.totalCount.set(res.data.total);
        }
      });
  }

  loadRules() {
    this.api.getFraudRules().subscribe((res) => {
      if (res.success && res.data) {
        this.rules.set(res.data);
      }
    });
  }

  onSearch() {
    this.page.set(1);
    this.loadAlerts();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadAlerts();
  }

  openInvestigation(id: string) {
    this.api.getFraudAlertById(id).subscribe((res) => {
      if (res.success) {
        this.selectedAlertDossier.set(res.data);
        this.investigationNotes = '';
      }
    });
  }

  submitDecision(decision: 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED') {
    const alertId = this.selectedAlertDossier()?.alert?.id;
    if (!alertId) return;

    this.api
      .investigateAlert(alertId, {
        decision: decision as FraudAlertStatus,
        notes: this.investigationNotes || `Decision marked as ${decision}`,
      })
      .subscribe(() => {
        this.selectedAlertDossier.set(null);
        this.loadAlerts();
      });
  }

  toggleRuleActive(rule: IFraudRule) {
    this.api.updateFraudRule(rule.id, { isActive: !rule.isActive }).subscribe((res) => {
      if (res.success) {
        rule.isActive = !rule.isActive;
      }
    });
  }
}
