import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Role, Session } from '../models/auth.models';
import { apiUrl } from './api.config';

const STORAGE_KEY = 'sas.session';
const ROLES: Role[] = ['ADMIN', 'TEACHER'];

/**
 * Token handling decision:
 *  - The access token lives in memory (a signal) while the app runs.
 *  - It is mirrored to **sessionStorage** so a page reload does not log you out. sessionStorage is
 *    per-tab and cleared when the tab closes; localStorage would survive restarts and be shared across
 *    tabs (more exposure). Both are readable by injected scripts (XSS), so Angular's template escaping,
 *    no third-party scripts and a short token lifetime matter. HttpOnly cookies would avoid this but
 *    need backend changes. Logout and expiry remove the stored copy.
 *  - Nothing sensitive is ever logged; the password is never kept.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly state = signal<Session | null>(this.restore());
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly username = computed(() => this.state()?.username ?? null);
  readonly role = computed(() => this.state()?.role ?? null);
  readonly isAdmin = computed(() => this.state()?.role === 'ADMIN');

  constructor() {
    this.scheduleExpiry();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(apiUrl('/auth/login'), credentials).pipe(tap((res) => this.start(res)));
  }

  /** Token for Authorization headers, or null when absent/expired (never mutates state). */
  token(): string | null {
    const s = this.state();
    return s && Date.now() < s.expiresAt ? s.accessToken : null;
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  hasRole(roles?: Role[]): boolean {
    const role = this.role();
    return !roles || roles.length === 0 || (role !== null && roles.includes(role));
  }

  logout(): void {
    this.clear();
    void this.router.navigate(['/login']);
  }

  /** Called when the token expires locally or the backend answers 401 to an authenticated call. */
  sessionEnded(): void {
    if (this.state() === null) return; // already handled: prevents redirect loops from parallel 401s
    const returnUrl = this.router.url;
    this.clear();
    void this.router.navigate(['/login'], {
      queryParams: { reason: 'expired', ...(returnUrl && !returnUrl.startsWith('/login') ? { returnUrl } : {}) },
    });
  }

  private start(res: LoginResponse): void {
    const role = this.normaliseRole(res.role);
    if (!res.accessToken || !role) {
      throw new Error('Unexpected login response.');
    }
    const session: Session = {
      accessToken: res.accessToken,
      username: res.username,
      role,
      expiresAt: Date.now() + Math.max(0, Number(res.expiresIn) || 0) * 1000,
    };
    this.state.set(session);
    this.persist(session);
    this.scheduleExpiry();
  }

  private clear(): void {
    clearTimeout(this.expiryTimer);
    this.state.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  private scheduleExpiry(): void {
    clearTimeout(this.expiryTimer);
    const s = this.state();
    if (!s) return;
    const delay = Math.min(Math.max(s.expiresAt - Date.now(), 0), 2_147_000_000);
    this.expiryTimer = setTimeout(() => this.sessionEnded(), delay);
  }

  private persist(session: Session): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* the session then lasts only until reload */
    }
  }

  private restore(): Session | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Partial<Session>;
      const role = this.normaliseRole(s.role);
      if (typeof s.accessToken !== 'string' || typeof s.username !== 'string' || !role || typeof s.expiresAt !== 'number' || s.expiresAt <= Date.now()) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return { accessToken: s.accessToken, username: s.username, role, expiresAt: s.expiresAt };
    } catch {
      return null;
    }
  }

  /** Accepts "ADMIN" or Spring-style "ROLE_ADMIN". */
  private normaliseRole(value: unknown): Role | null {
    if (typeof value !== 'string') return null;
    const r = value.replace(/^ROLE_/, '').toUpperCase() as Role;
    return ROLES.includes(r) ? r : null;
  }
}
