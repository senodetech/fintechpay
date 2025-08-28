import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { IAccount, AccountStatus, AccountType, Currency } from '@finpay360/shared-types';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, CurrencyFormatPipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Accounts & Balances</h1>
          <p class="text-xs text-slate-400 mt-1">Multi-currency ledger balances, available liquidity, and freeze/unfreeze controls</p>
        </div>
      </div>

      <!-- Accounts Grid / Table -->
      <div class="fintech-card rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px] relative">
            <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Search by masked account number or customer..."
              class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <select
            [(ngModel)]="selectedType"
            (change)="loadAccounts()"
            class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="CHECKING">CHECKING</option>
            <option value="SAVINGS">SAVINGS</option>
            <option value="BUSINESS">BUSINESS</option>
            <option value="MERCHANT">MERCHANT</option>
            <option value="WALLET">WALLET</option>
          </select>

          <select
            [(ngModel)]="selectedCurrency"
            (change)="loadAccounts()"
            class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="SGD">SGD (S$)</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Account Number</th>
                <th class="p-4">Customer Name</th>
                <th class="p-4">Type</th>
                <th class="p-4">Currency</th>
                <th class="p-4 text-right">Available Balance</th>
                <th class="p-4 text-right">Ledger Balance</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let a of accounts()" class="hover:bg-slate-900/60 transition font-sans">
                <td class="p-4 font-mono font-bold text-slate-200">{{ a.maskedAccountNumber }}</td>
                <td class="p-4 font-semibold text-white">{{ a.customerName }}</td>
                <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">{{ a.accountType }}</span></td>
                <td class="p-4 font-mono font-bold text-emerald-400">{{ a.currency }}</td>
                <td class="p-4 text-right font-mono font-bold text-white">{{ a.availableBalance | currencyFormat:a.currency }}</td>
                <td class="p-4 text-right font-mono text-slate-400">{{ a.ledgerBalance | currencyFormat:a.currency }}</td>
                <td class="p-4"><app-status-badge [status]="a.status"></app-status-badge></td>
                <td class="p-4 text-right">
                  <button
                    (click)="toggleFreezeAccount(a)"
                    class="px-3 py-1 text-xs font-semibold rounded-lg transition"
                    [ngClass]="a.status === 'ACTIVE' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'"
                  >
                    {{ a.status === 'ACTIVE' ? 'Freeze' : 'Unfreeze' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {{ page() }} of {{ totalPages() }} ({{ totalCount() }} accounts)</span>
          <div class="flex space-x-2">
            <button (click)="changePage(page() - 1)" [disabled]="page() <= 1" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Previous</button>
            <button (click)="changePage(page() + 1)" [disabled]="page() >= totalPages()" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccountsComponent implements OnInit {
  private api = inject(ApiService);

  public accounts = signal<IAccount[]>([]);
  public page = signal(1);
  public totalPages = signal(1);
  public totalCount = signal(0);
  public searchQuery = '';
  public selectedType = '';
  public selectedCurrency = '';

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.api
      .getAccounts({
        page: this.page(),
        limit: 10,
        search: this.searchQuery,
        accountType: this.selectedType || undefined,
        currency: this.selectedCurrency || undefined,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data.items);
          this.totalPages.set(res.data.totalPages);
          this.totalCount.set(res.data.total);
        }
      });
  }

  onSearch() {
    this.page.set(1);
    this.loadAccounts();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadAccounts();
  }

  toggleFreezeAccount(account: IAccount) {
    const newStatus = account.status === AccountStatus.ACTIVE ? AccountStatus.FROZEN : AccountStatus.ACTIVE;
    const reason = prompt(`Reason for ${newStatus === 'FROZEN' ? 'freezing' : 'unfreezing'} account:`, 'Administrative compliance check');
    if (reason) {
      this.api.updateAccountStatus(account.id, { status: newStatus, reason }).subscribe((res) => {
        if (res.success) {
          account.status = newStatus;
        }
      });
    }
  }
}
