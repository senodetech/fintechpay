import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { RealtimeService } from '../../../core/realtime/realtime.service';
import { ApiService } from '../../../core/services/api.service';
import { Role, INotification } from '@finpay360/shared-types';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <!-- Left: Brand -->
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <span class="material-icons text-white text-xl">account_balance_wallet</span>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-extrabold text-lg text-white tracking-tight">FinPay<span class="text-emerald-400">360</span></span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ENTERPRISE</span>
          </div>
          <p class="text-[11px] text-slate-400 -mt-0.5">Banking & Payment Intelligence</p>
        </div>
      </div>

      <!-- Center: Telemetry Status -->
      <div class="hidden md:flex items-center space-x-4">
        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
          <span class="w-2 h-2 rounded-full" [ngClass]="realtime.isConnected() ? 'bg-emerald-400 animate-pulse-emerald' : 'bg-rose-500'"></span>
          <span>{{ realtime.isConnected() ? 'Live Telemetry Connected' : 'Telemetry Reconnecting...' }}</span>
        </div>
      </div>

      <!-- Right: Role Switcher & User Profile -->
      <div class="flex items-center space-x-4">
        <!-- Quick Role Switcher -->
        <div class="relative">
          <button
            (click)="toggleRoleDropdown()"
            class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-200 transition"
          >
            <span class="material-icons-outlined text-sm text-emerald-400">swap_horiz</span>
            <span>Role: <strong class="text-emerald-400">{{ auth.userRole() }}</strong></span>
            <span class="material-icons text-xs">arrow_drop_down</span>
          </button>

          <div *ngIf="showRoleDropdown()" class="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
            <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Persona</div>
            <button
              *ngFor="let r of availableRoles"
              (click)="selectRole(r)"
              class="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center justify-between transition"
              [class.bg-emerald-500/10]="auth.userRole() === r"
            >
              <span>{{ r }}</span>
              <span *ngIf="auth.userRole() === r" class="material-icons text-sm text-emerald-400">check</span>
            </button>
          </div>
        </div>

        <!-- Notifications Bell -->
        <div class="relative">
          <button
            (click)="toggleNotificationDropdown()"
            class="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-slate-300 relative transition"
          >
            <span class="material-icons-outlined text-lg">notifications</span>
            <span
              *ngIf="unreadCount() > 0"
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center"
            >
              {{ unreadCount() }}
            </span>
          </button>

          <!-- Notification Dropdown -->
          <div *ngIf="showNotificationDropdown()" class="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
            <div class="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span class="text-xs font-bold text-slate-200">Notifications</span>
              <button (click)="markAllAsRead()" class="text-[11px] text-emerald-400 hover:underline">Mark all read</button>
            </div>
            <div class="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              <div *ngFor="let n of notifications()" class="p-3 hover:bg-slate-800/50 transition">
                <div class="flex items-start justify-between">
                  <span class="text-xs font-semibold text-slate-200">{{ n.title }}</span>
                  <span class="text-[10px] text-slate-400">{{ n.createdAt | date:'shortTime' }}</span>
                </div>
                <p class="text-[11px] text-slate-400 mt-1">{{ n.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- User Logout -->
        <button
          (click)="auth.logout()"
          title="Sign Out"
          class="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700/60 flex items-center justify-center text-slate-400 transition"
        >
          <span class="material-icons-outlined text-lg">logout</span>
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent implements OnInit {
  public auth = inject(AuthService);
  public realtime = inject(RealtimeService);
  private api = inject(ApiService);

  public showRoleDropdown = signal(false);
  public showNotificationDropdown = signal(false);
  public notifications = signal<INotification[]>([]);
  public unreadCount = signal(0);

  public availableRoles = [
    Role.ADMIN,
    Role.OPERATIONS,
    Role.FINANCE,
    Role.RISK_ANALYST,
    Role.CUSTOMER_SUPPORT,
    Role.AUDITOR,
  ];

  ngOnInit() {
    this.loadNotifications();
    this.realtime.onNotification$.subscribe((n) => {
      this.notifications.update((list) => [n, ...list]);
      this.unreadCount.update((c) => c + 1);
    });
  }

  loadNotifications() {
    this.api.getNotifications().subscribe((res) => {
      if (res.success && res.data) {
        this.notifications.set(res.data.notifications);
        this.unreadCount.set(res.data.unreadCount);
      }
    });
  }

  markAllAsRead() {
    this.api.markAllNotificationsAsRead().subscribe(() => {
      this.unreadCount.set(0);
      this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    });
  }

  toggleRoleDropdown() {
    this.showRoleDropdown.update((v) => !v);
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown.update((v) => !v);
  }

  selectRole(role: Role) {
    this.showRoleDropdown.set(false);
    this.auth.switchRole(role).subscribe();
  }
}
