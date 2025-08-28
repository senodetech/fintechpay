import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 border-r border-slate-800/80 bg-slate-950/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div class="space-y-6">
        <!-- Main Section -->
        <div>
          <div class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Core Banking & Ops</div>
          <nav class="space-y-1">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">dashboard</span>
              <span>Dashboard</span>
            </a>

            <a
              routerLink="/customers"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">people</span>
              <span>Customers & KYC</span>
            </a>

            <a
              routerLink="/accounts"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">account_balance</span>
              <span>Accounts & Balances</span>
            </a>

            <a
              routerLink="/payments"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">payment</span>
              <span>Payment Processing</span>
            </a>

            <a
              routerLink="/transactions"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">receipt_long</span>
              <span>Double-Entry Ledger</span>
            </a>
          </nav>
        </div>

        <!-- Risk & Compliance Section -->
        <div>
          <div class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Risk & Intelligence</div>
          <nav class="space-y-1">
            <a
              routerLink="/fraud"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">security</span>
              <span>Fraud & Risk Engine</span>
            </a>

            <a
              routerLink="/reports"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">assessment</span>
              <span>Reconciliation Reports</span>
            </a>

            <a
              routerLink="/audit-logs"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span class="material-icons-outlined text-lg">history</span>
              <span>Compliance Audit Trail</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Footer / Version -->
      <div class="pt-4 border-t border-slate-800/80">
        <a
          routerLink="/settings"
          routerLinkActive="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition mb-2"
        >
          <span class="material-icons-outlined text-lg">settings</span>
          <span>Platform Settings</span>
        </a>
        <div class="px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>FinPay360 Core</span>
          <span class="font-mono text-emerald-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {}
