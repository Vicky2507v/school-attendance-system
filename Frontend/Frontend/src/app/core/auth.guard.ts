import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/auth.models';
import { ToastService } from '../shared/toast.service';
import { AuthService } from './auth.service';

/** Blocks the app shell for anonymous users and remembers where they were going. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Route data: { roles: Role[] }. Wrong role → back to the dashboard with a message. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as Role[] | undefined;
  if (auth.hasRole(roles)) return true;
  inject(ToastService).error('You do not have access to that page.');
  return router.createUrlTree(['/dashboard']);
};

/** Keeps signed-in users away from the login page. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
