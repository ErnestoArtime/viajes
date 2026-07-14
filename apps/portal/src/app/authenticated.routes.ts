import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { featureEnabledGuard } from './core/guards/feature-enabled.guard';

export const AUTHENTICATED_ROUTES: Routes = [
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'cuenta', canMatch: [featureEnabledGuard], data: { feature: 'auth.enabled' }, loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) }
];
