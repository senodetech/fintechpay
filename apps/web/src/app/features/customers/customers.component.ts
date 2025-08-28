import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { RiskScorePipe } from '../../shared/pipes/risk-score.pipe';
import { ICustomer, KycStatus, RiskLevel } from '@finpay360/shared-types';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, RiskScorePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Customer Management & KYC</h1>
          <p class="text-xs text-slate-400 mt-1">Client directory, risk profiles, identity verification status, and portfolio accounts</p>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
        >
          <span class="material-icons text-sm">person_add</span>
          <span>New Customer</span>
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="fintech-card p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px] relative">
          <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search by name, email, or customer ID..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <select
          [(ngModel)]="selectedKyc"
          (change)="loadCustomers()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All KYC Statuses</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="PENDING">PENDING</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <select
          [(ngModel)]="selectedRisk"
          (change)="loadCustomers()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Risk Levels</option>
          <option value="LOW">LOW Risk</option>
          <option value="MEDIUM">MEDIUM Risk</option>
          <option value="HIGH">HIGH Risk</option>
          <option value="CRITICAL">CRITICAL Risk</option>
        </select>
      </div>

      <!-- Customers Table -->
      <div class="fintech-card rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Customer ID</th>
                <th class="p-4">Name</th>
                <th class="p-4">Email</th>
                <th class="p-4">Country</th>
                <th class="p-4">KYC Status</th>
                <th class="p-4">Risk Score</th>
                <th class="p-4">Account Status</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let c of customers()" class="hover:bg-slate-900/60 transition font-sans">
                <td class="p-4 font-mono font-bold text-slate-200">{{ c.customerNumber }}</td>
                <td class="p-4 font-semibold text-white">{{ c.firstName }} {{ c.lastName }}</td>
                <td class="p-4 text-slate-400 font-mono">{{ c.email }}</td>
                <td class="p-4 font-mono">{{ c.country }}</td>
                <td class="p-4"><app-status-badge [status]="c.kycStatus"></app-status-badge></td>
                <td class="p-4">
                  <div class="flex items-center space-x-2">
                    <span class="font-mono font-bold">{{ c.riskScore }}/100</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border" [ngClass]="(c.riskScore | riskScoreBadge).bgClass + ' ' + (c.riskScore | riskScoreBadge).textClass">
                      {{ (c.riskScore | riskScoreBadge).label }}
                    </span>
                  </div>
                </td>
                <td class="p-4"><app-status-badge [status]="c.status"></app-status-badge></td>
                <td class="p-4 text-right">
                  <button
                    (click)="viewCustomer(c.id)"
                    class="px-3 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    View 360°
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {{ page() }} of {{ totalPages() }} ({{ totalCount() }} customers)</span>
          <div class="flex space-x-2">
            <button
              (click)="changePage(page() - 1)"
              [disabled]="page() <= 1"
              class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300"
            >
              Previous
            </button>
            <button
              (click)="changePage(page() + 1)"
              [disabled]="page() >= totalPages()"
              class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Customer 360 Modal / Drawer -->
      <div *ngIf="selectedCustomerProfile()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="fintech-card bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                {{ selectedCustomerProfile()?.customer?.firstName?.slice(0, 1) }}
              </div>
              <div>
                <h3 class="text-base font-bold text-white">
                  {{ selectedCustomerProfile()?.customer?.firstName }} {{ selectedCustomerProfile()?.customer?.lastName }}
                </h3>
                <span class="text-xs text-slate-400 font-mono">{{ selectedCustomerProfile()?.customer?.customerNumber }} • {{ selectedCustomerProfile()?.customer?.email }}</span>
              </div>
            </div>
            <button (click)="closeCustomerProfile()" class="text-slate-400 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6">
            <!-- KYC & Risk Card -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-[11px] text-slate-400 font-semibold uppercase">KYC Status</span>
                <div class="mt-2 flex items-center justify-between">
                  <app-status-badge [status]="selectedCustomerProfile()?.customer?.kycStatus || ''"></app-status-badge>
                  <button (click)="toggleKycVerification()" class="text-xs text-emerald-400 hover:underline">Change</button>
                </div>
              </div>
              <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-[11px] text-slate-400 font-semibold uppercase">Calculated Risk</span>
                <div class="mt-2 text-lg font-bold font-mono text-white">
                  {{ selectedCustomerProfile()?.customer?.riskScore }} / 100
                </div>
              </div>
              <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-[11px] text-slate-400 font-semibold uppercase">Country / Jurisdiction</span>
                <div class="mt-2 text-base font-bold font-mono text-emerald-400">
                  {{ selectedCustomerProfile()?.customer?.country }}
                </div>
              </div>
            </div>

            <!-- Associated Accounts -->
            <div>
              <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Active Banking & Wallet Accounts</h4>
              <div class="space-y-2">
                <div *ngFor="let acc of selectedCustomerProfile()?.accounts" class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-mono font-bold text-white">{{ acc.maskedAccountNumber }}</span>
                    <span class="ml-2 text-[11px] text-slate-400 font-sans">({{ acc.accountType }})</span>
                  </div>
                  <div class="text-right font-mono font-bold text-emerald-400 text-xs">
                    \${{ acc.availableBalance }} {{ acc.currency }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CustomersComponent implements OnInit {
  private api = inject(ApiService);

  public customers = signal<ICustomer[]>([]);
  public page = signal(1);
  public totalPages = signal(1);
  public totalCount = signal(0);
  public searchQuery = '';
  public selectedKyc = '';
  public selectedRisk = '';

  public selectedCustomerProfile = signal<any>(null);

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.api
      .getCustomers({
        page: this.page(),
        limit: 10,
        search: this.searchQuery,
        kycStatus: this.selectedKyc || undefined,
        riskLevel: this.selectedRisk || undefined,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.customers.set(res.data.items);
          this.totalPages.set(res.data.totalPages);
          this.totalCount.set(res.data.total);
        }
      });
  }

  onSearch() {
    this.page.set(1);
    this.loadCustomers();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadCustomers();
  }

  viewCustomer(id: string) {
    this.api.getCustomerById(id).subscribe((res) => {
      if (res.success) {
        this.selectedCustomerProfile.set(res.data);
      }
    });
  }

  closeCustomerProfile() {
    this.selectedCustomerProfile.set(null);
  }

  toggleKycVerification() {
    const current = this.selectedCustomerProfile()?.customer;
    if (!current) return;
    const newKyc = current.kycStatus === 'VERIFIED' ? KycStatus.PENDING : KycStatus.VERIFIED;
    this.api.updateKycStatus(current.id, { kycStatus: newKyc }).subscribe((res) => {
      if (res.success) {
        current.kycStatus = newKyc;
        this.loadCustomers();
      }
    });
  }

  openCreateModal() {
    const fn = prompt('First Name:');
    const ln = prompt('Last Name:');
    const em = prompt('Email:');
    if (fn && ln && em) {
      this.api.createCustomer({ firstName: fn, lastName: ln, email: em, phone: '+1-555-0199', country: 'US' }).subscribe(() => {
        this.loadCustomers();
      });
    }
  }
}
