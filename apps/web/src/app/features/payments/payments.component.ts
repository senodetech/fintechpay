import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RiskScorePipe } from '../../shared/pipes/risk-score.pipe';
import { MaskAccountPipe } from '../../shared/pipes/mask-account.pipe';
import {
  IPayment,
  PaymentStatus,
  PaymentMethod,
  Currency,
  CreatePaymentDto,
  IAccount,
} from '@finpay360/shared-types';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    CurrencyFormatPipe,
    RiskScorePipe,
    MaskAccountPipe,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Payment Operations & Lifecycle</h1>
          <p class="text-xs text-slate-400 mt-1">Multi-rail payment processing, state machine transitions, and idempotency control</p>
        </div>
        <button
          (click)="openNewPaymentModal()"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
        >
          <span class="material-icons text-sm">add_card</span>
          <span>Initiate Payment</span>
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
            placeholder="Search by payment reference, provider ID, or customer..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <select
          [(ngModel)]="selectedStatus"
          (change)="loadPayments()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          [(ngModel)]="selectedMethod"
          (change)="loadPayments()"
          class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Rails / Methods</option>
          <option value="CARD">CARD</option>
          <option value="BANK_TRANSFER">BANK TRANSFER</option>
          <option value="ACH">ACH</option>
          <option value="SEPA">SEPA</option>
          <option value="UPI">UPI</option>
          <option value="WIRE">WIRE</option>
        </select>
      </div>

      <!-- Payments Table -->
      <div class="fintech-card rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Payment Reference</th>
                <th class="p-4">Customer</th>
                <th class="p-4">Source Account</th>
                <th class="p-4">Dest Account</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Method / Rail</th>
                <th class="p-4">Risk Score</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let p of payments()" class="hover:bg-slate-900/60 transition font-sans">
                <td class="p-4 font-mono font-bold text-slate-200">{{ p.paymentReference }}</td>
                <td class="p-4 font-semibold text-white">{{ p.customerName }}</td>
                <td class="p-4 font-mono text-slate-400">{{ p.sourceAccountNumber || (p.sourceAccountId | maskAccount) }}</td>
                <td class="p-4 font-mono text-slate-400">{{ p.destinationAccountNumber || (p.destinationAccountId | maskAccount) }}</td>
                <td class="p-4 font-mono font-bold text-emerald-400 text-sm">
                  {{ p.amount | currencyFormat:p.currency }}
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {{ p.paymentMethod }}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-mono font-bold">{{ p.riskScore }}</span>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-bold border" [ngClass]="(p.riskScore | riskScoreBadge).bgClass + ' ' + (p.riskScore | riskScoreBadge).textClass">
                      {{ (p.riskScore | riskScoreBadge).label }}
                    </span>
                  </div>
                </td>
                <td class="p-4"><app-status-badge [status]="p.status"></app-status-badge></td>
                <td class="p-4 text-right">
                  <button
                    (click)="viewPaymentDetails(p.id)"
                    class="px-3 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {{ page() }} of {{ totalPages() }} ({{ totalCount() }} payments)</span>
          <div class="flex space-x-2">
            <button (click)="changePage(page() - 1)" [disabled]="page() <= 1" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Previous</button>
            <button (click)="changePage(page() + 1)" [disabled]="page() >= totalPages()" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Next</button>
          </div>
        </div>
      </div>

      <!-- Initiate Payment Modal -->
      <div *ngIf="showNewPaymentModal()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="fintech-card bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 class="text-base font-bold text-white">Initiate New Payment</h3>
              <p class="text-xs text-slate-400">Funds transfer with automated fraud screening and idempotency key</p>
            </div>
            <button (click)="closeNewPaymentModal()" class="text-slate-400 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <form (ngSubmit)="submitNewPayment()" class="space-y-4">
            <!-- Idempotency Key Banner -->
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase text-slate-400">Idempotency Key (Distributed Lock)</span>
                <p class="text-xs font-mono text-emerald-400 font-bold">{{ newPaymentForm.idempotencyKey }}</p>
              </div>
              <button type="button" (click)="regenerateIdempotencyKey()" class="text-xs text-slate-400 hover:text-white">
                <span class="material-icons text-sm">refresh</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Source Account</label>
                <select
                  [(ngModel)]="newPaymentForm.sourceAccountId"
                  name="sourceAccountId"
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option *ngFor="let a of availableAccounts" [value]="a.id">
                    {{ a.customerName }} - {{ a.maskedAccountNumber }} (\${{ a.availableBalance }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Destination Account</label>
                <select
                  [(ngModel)]="newPaymentForm.destinationAccountId"
                  name="destinationAccountId"
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option *ngFor="let a of availableAccounts" [value]="a.id">
                    {{ a.customerName }} - {{ a.maskedAccountNumber }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="newPaymentForm.amount"
                  name="amount"
                  required
                  placeholder="250.00"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  [(ngModel)]="newPaymentForm.paymentMethod"
                  name="paymentMethod"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="CARD">CARD</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="ACH">ACH</option>
                  <option value="SEPA">SEPA</option>
                  <option value="UPI">UPI</option>
                  <option value="WIRE">WIRE</option>
                </select>
              </div>
            </div>

            <div *ngIf="paymentError()" class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
              {{ paymentError() }}
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                (click)="closeNewPaymentModal()"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
              >
                <span>{{ isSubmitting() ? 'Executing Settlement...' : 'Authorize & Process' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Payment Inspection Modal -->
      <div *ngIf="selectedPaymentDossier()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="fintech-card bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-base font-bold text-white font-mono">{{ selectedPaymentDossier()?.payment?.paymentReference }}</span>
                <app-status-badge [status]="selectedPaymentDossier()?.payment?.status"></app-status-badge>
              </div>
              <span class="text-xs text-slate-400">Provider Ref: {{ selectedPaymentDossier()?.payment?.providerReference || 'Pending' }}</span>
            </div>
            <button (click)="selectedPaymentDossier.set(null)" class="text-slate-400 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <!-- Amount and Accounts -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold">Settled Amount</span>
              <p class="text-xl font-bold font-mono text-emerald-400 mt-1">
                {{ selectedPaymentDossier()?.payment?.amount | currencyFormat:selectedPaymentDossier()?.payment?.currency }}
              </p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold">Evaluated Risk Score</span>
              <p class="text-xl font-bold font-mono text-white mt-1">
                {{ selectedPaymentDossier()?.payment?.riskScore }} / 100
              </p>
            </div>
          </div>

          <!-- Lifecycle State Machine Timeline -->
          <div>
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Lifecycle State Machine Timeline</h4>
            <div class="space-y-3">
              <div *ngFor="let ev of selectedPaymentDossier()?.events" class="flex items-start space-x-3 text-xs">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] mt-0.5">
                  ✓
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-200">{{ ev.fromStatus }} ➔ {{ ev.toStatus }}</span>
                    <span class="text-[10px] text-slate-400">{{ ev.createdAt | date:'mediumTime' }}</span>
                  </div>
                  <p class="text-slate-400 text-[11px]">{{ ev.reason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              *ngIf="selectedPaymentDossier()?.payment?.status === 'COMPLETED'"
              (click)="triggerRefund(selectedPaymentDossier()!.payment.id)"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
            >
              Refund Payment
            </button>
            <button
              (click)="selectedPaymentDossier.set(null)"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentsComponent implements OnInit {
  private api = inject(ApiService);

  public payments = signal<IPayment[]>([]);
  public page = signal(1);
  public totalPages = signal(1);
  public totalCount = signal(0);
  public searchQuery = '';
  public selectedStatus = '';
  public selectedMethod = '';

  public showNewPaymentModal = signal(false);
  public isSubmitting = signal(false);
  public paymentError = signal<string | null>(null);
  public selectedPaymentDossier = signal<any>(null);
  public availableAccounts: IAccount[] = [];

  public newPaymentForm: CreatePaymentDto = {
    idempotencyKey: crypto.randomUUID(),
    customerId: '',
    sourceAccountId: '',
    destinationAccountId: '',
    amount: '150.00',
    currency: Currency.USD,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
  };

  ngOnInit() {
    this.loadPayments();
    this.loadAccounts();
  }

  loadPayments() {
    this.api
      .getPayments({
        page: this.page(),
        limit: 10,
        search: this.searchQuery,
        status: (this.selectedStatus as PaymentStatus) || undefined,
        paymentMethod: (this.selectedMethod as PaymentMethod) || undefined,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.payments.set(res.data.items);
          this.totalPages.set(res.data.totalPages);
          this.totalCount.set(res.data.total);
        }
      });
  }

  loadAccounts() {
    this.api.getAccounts({ limit: 100 }).subscribe((res) => {
      if (res.success && res.data) {
        this.availableAccounts = res.data.items;
        if (this.availableAccounts.length >= 2) {
          this.newPaymentForm.sourceAccountId = this.availableAccounts[0].id;
          this.newPaymentForm.customerId = this.availableAccounts[0].customerId;
          this.newPaymentForm.destinationAccountId = this.availableAccounts[1].id;
        }
      }
    });
  }

  onSearch() {
    this.page.set(1);
    this.loadPayments();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadPayments();
  }

  openNewPaymentModal() {
    this.regenerateIdempotencyKey();
    this.paymentError.set(null);
    this.showNewPaymentModal.set(true);
  }

  closeNewPaymentModal() {
    this.showNewPaymentModal.set(false);
  }

  regenerateIdempotencyKey() {
    this.newPaymentForm.idempotencyKey = crypto.randomUUID();
  }

  submitNewPayment() {
    this.isSubmitting.set(true);
    this.paymentError.set(null);

    const sourceAcc = this.availableAccounts.find((a) => a.id === this.newPaymentForm.sourceAccountId);
    if (sourceAcc) {
      this.newPaymentForm.customerId = sourceAcc.customerId;
    }

    this.api.createPayment(this.newPaymentForm).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeNewPaymentModal();
        this.loadPayments();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.paymentError.set(err?.error?.error?.message || 'Payment execution failed.');
      },
    });
  }

  viewPaymentDetails(id: string) {
    this.api.getPaymentById(id).subscribe((res) => {
      if (res.success) {
        this.selectedPaymentDossier.set(res.data);
      }
    });
  }

  triggerRefund(id: string) {
    const reason = prompt('Please specify reason for refund:', 'Customer requested refund');
    if (reason) {
      this.api.refundPayment(id, { reason }).subscribe(() => {
        this.selectedPaymentDossier.set(null);
        this.loadPayments();
      });
    }
  }
}
