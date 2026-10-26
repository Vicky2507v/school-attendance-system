import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL, apiUrl } from './api.config';
import { AuthService } from './auth.service';

/**
 * Adds "Authorization: Bearer <token>" to calls to OUR backend only (URL starts with the configured API base),
 * never to the login call or to any other host. A 401 on an authenticated call ends the session once and
 * sends the user to /login (the login request itself is excluded, so a wrong password cannot cause a loop).
 *
 * Registered AFTER errorInterceptor in app.config so it sees the raw HttpErrorResponse.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isBackendCall = req.url.startsWith(`${API_BASE_URL}/`);
  const isLogin = req.url === apiUrl('/auth/login');
  const token = isBackendCall && !isLogin ? auth.token() : null;

  const outgoing = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && isBackendCall && !isLogin) {
        auth.sessionEnded();
      }
      return throwError(() => err);
    }),
  );
};
