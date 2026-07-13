import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.whenReady();
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/features/auth'], { queryParams: { returnUrl: state.url } });
};
