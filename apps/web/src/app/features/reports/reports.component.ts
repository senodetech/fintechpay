import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Financial & Reconciliation Reports</h1>
          <p class="text-xs text-slate-400 mt-1">Operational settlement statements, network fee breakdown, and regulatory audit exports</p>
        </div>
      </div>

      <!-- Report Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. Daily Settlement & Reconciliation -->
        <div class="fintech-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <span class="material-icons text-xl">account_balance</span>
            </div>
            <h3 class="text-base font-bold text-white">Daily Multi-Rail Reconciliation</h3>
            <p class="text-xs text-slate-400 mt-1">Cross-balances ACH, SEPA, UPI, and Card networks against internal core ledger postings.</p>
            <div class="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div class="flex justify-between text-slate-400"><span>Gross Settled:</span> <strong class="text-white font-mono">$24,840,210.00</strong></div>
              <div class="flex justify-between text-slate-400"><span>Variance:</span> <strong class="text-emerald-400 font-mono">$0.00 (Balanced)</strong></div>
            </div>
          </div>
          <a
            [href]="getCsvUrl()"
            target="_blank"
            class="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30"
          >
            <span class="material-icons text-sm">download</span>
            <span>Download Settlement CSV</span>
          </a>
        </div>

        <!-- 2. Fraud & Chargeback Risk Report -->
        <div class="fintech-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
              <span class="material-icons text-xl">security</span>
            </div>
            <h3 class="text-base font-bold text-white">Fraud & Risk Exposure Report</h3>
            <p class="text-xs text-slate-400 mt-1">Summary of flagged anomalies, false positive ratios, blocked transactions, and rule performance.</p>
            <div class="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div class="flex justify-between text-slate-400"><span>Confirmed Fraud:</span> <strong class="text-rose-400 font-mono">0.04% (Low)</strong></div>
              <div class="flex justify-between text-slate-400"><span>False Positive Rate:</span> <strong class="text-slate-300 font-mono">1.2%</strong></div>
            </div>
          </div>
          <a
            [href]="getCsvUrl()"
            target="_blank"
            class="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition text-center flex items-center justify-center space-x-2"
          >
            <span class="material-icons text-sm text-rose-400">download</span>
            <span>Export Risk CSV</span>
          </a>
        </div>

        <!-- 3. Payment Processing & Fees Report -->
        <div class="fintech-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 border border-teal-500/20">
              <span class="material-icons text-xl">receipt_long</span>
            </div>
            <h3 class="text-base font-bold text-white">Interchange & Rail Fee Analysis</h3>
            <p class="text-xs text-slate-400 mt-1">Detailed fee schedules, processor margins, gateway costs, and volume tier breakdowns.</p>
            <div class="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div class="flex justify-between text-slate-400"><span>Effective Rail Fee:</span> <strong class="text-white font-mono">1.18%</strong></div>
              <div class="flex justify-between text-slate-400"><span>Net Platform Revenue:</span> <strong class="text-emerald-400 font-mono">$184,250.00</strong></div>
            </div>
          </div>
          <a
            [href]="getCsvUrl()"
            target="_blank"
            class="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition text-center flex items-center justify-center space-x-2"
          >
            <span class="material-icons text-sm text-teal-400">download</span>
            <span>Export Fee Schedule</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ReportsComponent {
  getCsvUrl(): string {
    return `${environment.apiUrl}/transactions/export/csv`;
  }
}
