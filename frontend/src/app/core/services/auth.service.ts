import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../domain/models/user.model';

const TOKEN_KEY   = 'u_access_token';
const REFRESH_KEY = 'u_refresh_token';
const USER_KEY    = 'u_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api    = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(this.loadStoredUser());
  private readonly _isLoading   = signal(false);

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoading    = this._isLoading.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isAdmin      = computed(() => this._currentUser()?.role === 'Administrator');

  login(request: LoginRequest) {
    this._isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.api}/login`, request).pipe(
      tap(res => this.storeSession(res)),
      catchError(err => { this._isLoading.set(false); return throwError(() => err); })
    );
  }

  register(request: RegisterRequest) {
    this._isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.api}/register`, request).pipe(
      tap(res => this.storeSession(res)),
      catchError(err => { this._isLoading.set(false); return throwError(() => err); })
    );
  }

  refreshToken() {
    const token = localStorage.getItem(REFRESH_KEY);
    if (!token) return throwError(() => new Error('No refresh token'));

    return this.http.post<AuthResponse>(`${this.api}/refresh-token`, { refreshToken: token }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      this.http.post(`${this.api}/revoke-token`, { refreshToken }).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this._currentUser.set(response.user);
    this._isLoading.set(false);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }
}
