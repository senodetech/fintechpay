import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IUser, Role, AuthResponseDto, LoginDto, DemoUserDto, ApiResponse } from '@finpay360/shared-types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  public currentUser = signal<IUser | null>(null);
  public isAuthenticated = computed(() => !!this.currentUser());
  public userRole = computed(() => this.currentUser()?.roles?.[0] || Role.OPERATIONS);

  private readonly TOKEN_KEY = 'finpay360_access_token';
  private readonly REFRESH_KEY = 'finpay360_refresh_token';

  constructor() {
    this.restoreSession();
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  public login(dto: LoginDto): Observable<ApiResponse<AuthResponseDto>> {
    return this.http
      .post<ApiResponse<AuthResponseDto>>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.setSession(res.data);
          }
        }),
      );
  }

  public switchRole(role: Role): Observable<ApiResponse<AuthResponseDto>> {
    return this.login({ email: '', role });
  }

  public fetchDemoUsers(): Observable<ApiResponse<DemoUserDto[]>> {
    return this.http.get<ApiResponse<DemoUserDto[]>>(`${environment.apiUrl}/auth/demo-users`);
  }

  public logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        error: () => {},
      });
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authData: AuthResponseDto): void {
    localStorage.setItem(this.TOKEN_KEY, authData.accessToken);
    localStorage.setItem(this.REFRESH_KEY, authData.refreshToken);
    this.currentUser.set(authData.user);
  }

  private restoreSession(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.get<ApiResponse<IUser>>(`${environment.apiUrl}/auth/me`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.currentUser.set(res.data);
          }
        },
        error: () => {
          this.currentUser.set(null);
        },
      });
    }
  }
}
