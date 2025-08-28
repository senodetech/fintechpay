import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { MaskAccountPipe } from '../../shared/pipes/mask-account.pipe';
import { ITransaction, ILedgerEntry, TransactionType, TransactionStatus, Currency } from '@finpay360/shared-types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, CurrencyFormatPipe, MaskAccountPipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Double-Entry Transaction Ledger</h1>
          <p class="text-xs text-slate-400 mt-1">Immutable journal records with mathematical balance invariant enforcement (Debit = Credit)</p>
        </div>
        <a
          [href]="getExportCsvUrl()"
          target="_blank"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-2"
        >
          <span class="material-icons text-sm text-emerald-400">download</span>
          <span>Export CSV</span>
        </a>
      </div>

      <!-- Server-side Filters -->
      <div class="fintech-card p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px] relative">
          <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search by transaction reference or description..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <select
          [(ngModel)]="selectedType"
          (change)="loadTransactions()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Types</option>
          <option value="TRANSFER">TRANSFER</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="DEBIT">DEBIT</option>
          <option value="CREDIT">CREDIT</option>
          <option value="REFUND">REFUND</option>
        </select>

        <select
          [(ngModel)]="selectedStatus"
          (change)="loadTransactions()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="SETTLED">SETTLED</option>
          <option value="POSTED">POSTED</option>
          <option value="PENDING">PENDING</option>
          <option value="REVERSED">REVERSED</option>
        </select>

        <select
          [(ngModel)]="selectedCurrency"
          (change)="loadTransactions()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Currencies</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="INR">INR</option>
        </select>
      </div>

      <!-- Transactions Ledger Table -->
      <div class="fintech-card rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Reference</th>
                <th class="p-4">Account</th>
                <th class="p-4">Type</th>
                <th class="p-4">Direction</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Balance Before</th>
                <th class="p-4">Balance After</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Ledger</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let t of transactions()" class="hover:bg-slate-900/60 transition font-sans">
                <td class="p-4 font-mono font-bold text-slate-200">{{ t.transactionReference }}</td>
                <td class="p-4 font-mono text-slate-400">{{ t.accountNumber || (t.accountId | maskAccount) }}</td>
                <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">{{ t.type }}</span></td>
                <td class="p-4 font-mono font-bold" [ngClass]="t.direction === 'INBOUND' ? 'text-emerald-400' : 'text-slate-300'">
                  {{ t.direction }}
                </td>
                <td class="p-4 font-mono font-bold" [ngClass]="t.direction === 'INBOUND' ? 'text-emerald-400' : 'text-slate-200'">
                  {{ t.direction === 'INBOUND' ? '+' : '-' }}{{ t.amount | currencyFormat:t.currency }}
                </td>
                <td class="p-4 font-mono text-slate-400">{{ t.balanceBefore | currencyFormat:t.currency }}</td>
                <td class="p-4 font-mono text-slate-300">{{ t.balanceAfter | currencyFormat:t.currency }}</td>
                <td class="p-4"><app-status-badge [status]="t.status"></app-status-badge></td>
                <td class="p-4 text-right">
                  <button
                    (click)="viewLedgerEntries(t.id)"
                    class="px-3 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Postings
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {{ page() }} of {{ totalPages() }} ({{ totalCount() }} transactions)</span>
          <div class="flex space-x-2">
            <button (click)="changePage(page() - 1)" [disabled]="page() <= 1" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Previous</button>
            <button (click)="changePage(page() + 1)" [disabled]="page() >= totalPages()" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Next</button>
          </div>
        </div>
      </div>

      <!-- Ledger Postings Modal -->
      <div *ngIf="selectedLedgerTransaction()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="fintech-card bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 class="text-base font-bold text-white">Double-Entry Journal Postings</h3>
              <p class="text-xs text-slate-400 font-mono">Ref: {{ selectedLedgerTransaction()?.transaction?.transactionReference }}</p>
            </div>
            <button (click)="selectedLedgerTransaction.set(null)" class="text-slate-400 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Balanced Journal Lines (Σ Debit = Σ Credit)</div>
            <table class="w-full text-left">
              <thead>
                <tr class="text-slate-500 border-b border-slate-800">
                  <th class="py-2">Account</th>
                  <th class="py-2">Entry Type</th>
                  <th class="py-2 text-right">Debit</th>
                  <th class="py-2 text-right">Credit</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr *ngFor="let l of selectedLedgerTransaction()?.ledgerEntries">
                  <td class="py-2.5 text-slate-300">{{ l.accountNumber || (l.accountId | maskAccount) }}</td>
                  <td class="py-2.5 font-bold" [ngClass]="l.entryType === 'DEBIT' ? 'text-rose-400' : 'text-emerald-400'">{{ l.entryType }}</td>
                  <td class="py-2.5 text-right">{{ l.entryType === 'DEBIT' ? (l.amount | currencyFormat:l.currency) : '-' }}</td>
                  <td class="py-2.5 text-right">{{ l.entryType === 'CREDIT' ? (l.amount | currencyFormat:l.currency) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end pt-2">
            <button (click)="selectedLedgerTransaction.set(null)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TransactionsComponent implements OnInit {
  private api = inject(ApiService);

  public transactions = signal<ITransaction[]>([]);
  public page = signal(1);
  public totalPages = signal(1);
  public totalCount = signal(0);

  public searchQuery = '';
  public selectedType = '';
  public selectedStatus = '';
  public selectedCurrency = '';

  public selectedLedgerTransaction = signal<any>(null);

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.api
      .getTransactions({
        page: this.page(),
        limit: 15,
        search: this.searchQuery,
        type: (this.selectedType as TransactionType) || undefined,
        status: (this.selectedStatus as TransactionStatus) || undefined,
        currency: (this.selectedCurrency as Currency) || undefined,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.transactions.set(res.data.items);
          this.totalPages.set(res.data.totalPages);
          this.totalCount.set(res.data.total);
        }
      });
  }

  onSearch() {
    this.page.set(1);
    this.loadTransactions();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadTransactions();
  }

  viewLedgerEntries(id: string) {
    this.api.getTransactionById(id).subscribe((res) => {
      if (res.success) {
        this.selectedLedgerTransaction.set(res.data);
      }
    });
  }

  getExportCsvUrl(): string {
    return `${environment.apiUrl}/transactions/export/csv`;
  }
}
