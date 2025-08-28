import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <!-- Navbar (Rendered only when authenticated) -->
      <app-navbar *ngIf="auth.isAuthenticated()"></app-navbar>

      <!-- Main Layout -->
      <div class="flex-1 flex" *ngIf="auth.isAuthenticated()">
        <!-- Sidebar Navigation -->
        <app-sidebar></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Unauthenticated View (e.g. Login) -->
      <div *ngIf="!auth.isAuthenticated()" class="flex-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AppComponent {
  public auth = inject(AuthService);
}
