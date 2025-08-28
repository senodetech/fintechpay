import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Role, DemoUserDto } from '@finpay360/shared-types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <!-- Background decorative glow -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-4xl relative z-10">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-900/40 mb-4">
            <span class="material-icons text-white text-3xl">account_balance_wallet</span>
          </div>
          <h1 class="text-3xl font-black text-white tracking-tight">FinPay<span class="text-emerald-400">360</span></h1>
          <p class="text-slate-400 text-sm mt-1">Enterprise FinTech Operations, Core Banking & Fraud Intelligence Platform</p>
        </div>

        <!-- Quick Demo Personas Grid -->
        <div class="fintech-card p-6 rounded-2xl mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-white">Select an Enterprise Demo Persona</h2>
              <p class="text-xs text-slate-400">Instantly sign in with pre-configured RBAC roles and permissions</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OIDC / OAuth 2.0 PKCE</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              *ngFor="let p of demoPersonas"
              (click)="loginWithPersona(p.role)"
              [disabled]="loading()"
              class="fintech-card-hover bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-left flex flex-col justify-between group transition"
            >
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">{{ p.name }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">{{ p.role }}</span>
                </div>
                <p class="text-[11px] text-slate-400 line-clamp-2">{{ p.description }}</p>
              </div>
              <div class="flex items-center text-[11px] text-emerald-400 font-semibold mt-3">
                <span>Sign in as {{ p.role }}</span>
                <span class="material-icons text-xs ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Or Manual Email Sign-in -->
        <div class="fintech-card p-6 rounded-2xl">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Or Sign in with Custom Credentials</h3>
          <form (ngSubmit)="loginWithEmail()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="admin@finpay360.io"
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••••••"
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div *ngIf="errorMessage()" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {{ errorMessage() }}
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-[11px] text-slate-400">Protected by OpenID Connect with RSA256 Token Verification</span>
              <button
                type="submit"
                [disabled]="loading() || !email"
                class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-900/30 flex items-center space-x-2"
              >
                <span *ngIf="loading()" class="animate-spin material-icons text-sm">refresh</span>
                <span>{{ loading() ? 'Authenticating...' : 'Sign In' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  public email = 'admin@finpay360.io';
  public password = '';
  public loading = signal(false);
  public errorMessage = signal<string | null>(null);

  public demoPersonas: DemoUserDto[] = [];

  ngOnInit() {
    this.auth.fetchDemoUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.demoPersonas = res.data;
        }
      },
      error: () => {
        this.demoPersonas = [
          {
            id: 'usr-admin-001',
            email: 'admin@finpay360.io',
            name: 'Alexander Vance (System Admin)',
            role: Role.ADMIN,
            description: 'Full administrative access to users, accounts, fraud, and ledger',
          },
          {
            id: 'usr-ops-002',
            email: 'ops@finpay360.io',
            name: 'Elena Rostova (Operations Lead)',
            role: Role.OPERATIONS,
            description: 'Manages customer onboarding, accounts, payments, and refunds',
          },
          {
            id: 'usr-risk-004',
            email: 'risk@finpay360.io',
            name: 'Sophia Chen (Risk Analyst)',
            role: Role.RISK_ANALYST,
            description: 'Fraud alert investigation, rule tuning, and risk reports',
          },
        ];
      },
    });
  }

  loginWithPersona(role: Role) {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.login({ email: '', role }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.error?.message || 'Authentication failed.');
      },
    });
  }

  loginWithEmail() {
    if (!this.email) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.error?.message || 'Invalid email credentials.');
      },
    });
  }
}
