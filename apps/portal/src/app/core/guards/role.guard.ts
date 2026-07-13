import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '@viajes/supabase-adapter';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] ?? []) as UserRole[];

  await auth.whenReady();
  return auth.hasRole(roles) ? true : router.createUrlTree(['/home']);
};
