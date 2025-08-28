import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight">Platform Settings & Security</h1>
        <p class="text-xs text-slate-400 mt-1">Role-Based Access Control (RBAC) matrix, OpenID Connect SSO, and operational thresholds</p>
      </div>

      <!-- RBAC Matrix Table -->
      <div class="fintech-card p-6 rounded-2xl space-y-4">
        <div>
          <h2 class="text-base font-bold text-white">Role-Based Access Control (RBAC) Matrix</h2>
          <p class="text-xs text-slate-400">Enterprise permission policies enforced across all NestJS microservice modules</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-3">Resource / Operation</th>
                <th class="p-3 text-center">ADMIN</th>
                <th class="p-3 text-center">OPERATIONS</th>
                <th class="p-3 text-center">FINANCE</th>
                <th class="p-3 text-center">RISK_ANALYST</th>
                <th class="p-3 text-center">SUPPORT</th>
                <th class="p-3 text-center">AUDITOR</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let row of rbacRows" class="hover:bg-slate-900/60 transition">
                <td class="p-3 font-sans font-semibold text-slate-200">{{ row.resource }}</td>
                <td class="p-3 text-center" [ngClass]="row.admin ? 'text-emerald-400 font-bold' : 'text-slate-600'">{{ row.admin ? '✓' : '—' }}</td>
                <td class="p-3 text-center" [ngClass]="row.ops ? 'text-emerald-400 font-bold' : 'text-slate-600'">{{ row.ops ? '✓' : '—' }}</td>
                <td class="p-3 text-center" [ngClass]="row.fin ? 'text-emerald-400 font-bold' : 'text-slate-600'">{{ row.fin ? '✓' : '—' }}</td>
                <td class="p-3 text-center" [ngClass]="row.risk ? 'text-emerald-400 font-bold' : 'text-slate-600'">{{ row.risk ? '✓' : '—' }}</td>
                <td class="p-3 text-center" [ngClass]="row.support ? 'text-emerald-400 font-bold' : 'text-slate-600'">{{ row.support ? '✓' : '—' }}</td>
                <td class="p-3 text-center" [ngClass]="row.auditor ? 'text-emerald-400 font-bold' : 'text-slate-600'">{{ row.auditor ? '✓' : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Infrastructure & Security Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="fintech-card p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-bold text-white">OAuth 2.0 & Token Policies</h3>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Flow Type:</span>
              <strong class="text-white font-mono">Authorization Code + PKCE</strong>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Access Token Lifetime:</span>
              <strong class="text-emerald-400 font-mono">900 seconds (15m)</strong>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Refresh Token Window:</span>
              <strong class="text-white font-mono">7 days (Sliding)</strong>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-slate-400">JWKS Signature Algorithm:</span>
              <strong class="text-white font-mono">RS256 / SHA-256</strong>
            </div>
          </div>
        </div>

        <div class="fintech-card p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-bold text-white">Financial Concurrency & Locks</h3>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Idempotency Lock TTL:</span>
              <strong class="text-white font-mono">30 seconds (Redlock)</strong>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Idempotency Cache Window:</span>
              <strong class="text-emerald-400 font-mono">86,400 seconds (24h)</strong>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">PostgreSQL Precision:</span>
              <strong class="text-white font-mono">NUMERIC(19, 4)</strong>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-slate-400">Double-Entry Balance Mode:</span>
              <strong class="text-emerald-400 font-mono">Strict Append-Only</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  public rbacRows = [
    { resource: 'User Management & Roles', admin: true, ops: true, fin: false, risk: false, support: false, auditor: true },
    { resource: 'Customer Profiles & KYC', admin: true, ops: true, fin: true, risk: true, support: true, auditor: true },
    { resource: 'Account Balances & Freeze', admin: true, ops: true, fin: true, risk: true, support: true, auditor: true },
    { resource: 'Initiate Payments', admin: true, ops: true, fin: true, risk: false, support: false, auditor: false },
    { resource: 'Refund & Cancel Payments', admin: true, ops: true, fin: true, risk: false, support: false, auditor: false },
    { resource: 'Double-Entry Ledger & CSV', admin: true, ops: true, fin: true, risk: true, support: true, auditor: true },
    { resource: 'Fraud Alerts & Rule Tuning', admin: true, ops: true, fin: false, risk: true, support: false, auditor: true },
    { resource: 'Reconciliation Reports', admin: true, ops: true, fin: true, risk: true, support: false, auditor: true },
    { resource: 'Compliance Audit Trail', admin: true, ops: false, fin: false, risk: false, support: false, auditor: true },
  ];
}
