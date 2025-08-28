import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { IAuditLog } from '@finpay360/shared-types';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Compliance & Security Audit Trail</h1>
          <p class="text-xs text-slate-400 mt-1">Append-only immutable record of all administrative, financial, and security actions</p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="fintech-card p-4 rounded-xl flex items-center gap-4">
        <div class="flex-1 relative">
          <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search audit trail by user email, action, entity ID, or IP..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="fintech-card rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th class="p-4">Timestamp</th>
                <th class="p-4">Operator / User</th>
                <th class="p-4">Action</th>
                <th class="p-4">Entity Type</th>
                <th class="p-4">Entity ID</th>
                <th class="p-4">IP Address</th>
                <th class="p-4">Result</th>
                <th class="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr *ngFor="let a of auditLogs()" class="hover:bg-slate-900/60 transition font-sans">
                <td class="p-4 font-mono text-slate-400 text-[11px]">{{ a.createdAt | date:'medium' }}</td>
                <td class="p-4 font-bold text-slate-200">{{ a.userEmail || 'System / Service' }}</td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700 font-mono">
                    {{ a.action }}
                  </span>
                </td>
                <td class="p-4 text-slate-300 font-mono">{{ a.entityType }}</td>
                <td class="p-4 text-slate-400 font-mono">{{ a.entityId }}</td>
                <td class="p-4 text-slate-400 font-mono">{{ a.ipAddress }}</td>
                <td class="p-4"><app-status-badge [status]="a.result"></app-status-badge></td>
                <td class="p-4 text-right">
                  <button
                    *ngIf="a.beforeState || a.afterState"
                    (click)="selectedLog.set(a)"
                    class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Diff
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {{ page() }} of {{ totalPages() }} ({{ totalCount() }} audit records)</span>
          <div class="flex space-x-2">
            <button (click)="changePage(page() - 1)" [disabled]="page() <= 1" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Previous</button>
            <button (click)="changePage(page() + 1)" [disabled]="page() >= totalPages()" class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300">Next</button>
          </div>
        </div>
      </div>

      <!-- Diff Inspector Modal -->
      <div *ngIf="selectedLog()" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="fintech-card bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 class="text-base font-bold text-white font-mono">{{ selectedLog()?.action }} State Diff</h3>
              <p class="text-xs text-slate-400">Entity: {{ selectedLog()?.entityType }} • ID: {{ selectedLog()?.entityId }}</p>
            </div>
            <button (click)="selectedLog.set(null)" class="text-slate-400 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs font-mono">
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] font-bold text-rose-400 uppercase">State Before</span>
              <pre class="mt-2 text-slate-400 whitespace-pre-wrap overflow-x-auto">{{ selectedLog()?.beforeState | json }}</pre>
            </div>
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] font-bold text-emerald-400 uppercase">State After</span>
              <pre class="mt-2 text-slate-300 whitespace-pre-wrap overflow-x-auto">{{ selectedLog()?.afterState | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditLogsComponent implements OnInit {
  private api = inject(ApiService);

  public auditLogs = signal<IAuditLog[]>([]);
  public page = signal(1);
  public totalPages = signal(1);
  public totalCount = signal(0);
  public searchQuery = '';

  public selectedLog = signal<IAuditLog | null>(null);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.api.getAuditLogs({ page: this.page(), limit: 15, search: this.searchQuery }).subscribe((res) => {
      if (res.success && res.data) {
        this.auditLogs.set(res.data.items);
        this.totalPages.set(res.data.totalPages);
        this.totalCount.set(res.data.total);
      }
    });
  }

  onSearch() {
    this.page.set(1);
    this.loadLogs();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadLogs();
  }
}
