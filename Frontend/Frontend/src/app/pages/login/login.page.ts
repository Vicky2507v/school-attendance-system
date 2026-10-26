import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { requiredTrimmed } from '../../core/utils';
import { ApiError } from '../../models/school.models';
import { FieldErrorComponent } from '../../shared/field-error.component';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(
    this.route.snapshot.queryParamMap.get('reason') === 'expired' ? 'Your session has expired. Please sign in again.' : null,
  );

  readonly form = this.fb.group({
    username: ['', [requiredTrimmed]],
    password: ['', [requiredTrimmed]],
  });

  submit(): void {
    if (this.loading()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { username, password } = this.form.getRawValue();
    this.error.set(null);
    this.notice.set(null);
    this.loading.set(true);

    this.auth
      .login({ username: (username ?? '').trim(), password: password ?? '' })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
        error: (e: ApiError | Error) => {
          this.form.controls.password.reset(''); // never keep the password around after a failed attempt
          this.error.set(this.messageFor(e));
        },
      });
  }

  /** Only allow in-app paths as post-login targets (prevents open redirects). */
  private safeReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login') ? url : '/dashboard';
  }

  private messageFor(e: ApiError | Error): string {
    const status = (e as ApiError).status;
    if (status === 400 || status === 401 || status === 403) return 'Invalid username or password.';
    if (status === 0) return 'Cannot reach the server. Check that the backend is running.';
    if (typeof status === 'number' && status >= 500) return 'The server had a problem. Please try again in a moment.';
    return 'Sign-in failed. Please try again.';
  }
}
