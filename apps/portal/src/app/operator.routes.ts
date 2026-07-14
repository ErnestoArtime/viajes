import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { featureEnabledGuard } from './core/guards/feature-enabled.guard';
import { roleGuard } from './core/guards/role.guard';

export const OPERATOR_ROUTES: Routes = [
  { path: 'features', canActivate: [authGuard, roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./admin/admin-features.component').then(m => m.AdminFeaturesComponent) },
  { path: 'producto', canActivate: [authGuard, roleGuard], data: { roles: ['operator', 'admin'] }, loadComponent: () => import('./features/operator-product/operator-product.component').then(m => m.OperatorProductComponent) },
  { path: 'reservas', canActivate: [authGuard, roleGuard], data: { roles: ['operator', 'admin'] }, loadComponent: () => import('./features/operator-requests/operator-requests.component').then(m => m.OperatorRequestsComponent) },
  { path: 'solicitudes', redirectTo: 'reservas', pathMatch: 'full' },
  { path: 'localizacion', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { anyFeature: ['multiLanguage.enabled', 'multiCurrency.enabled'], roles: ['operator', 'admin'] }, loadComponent: () => import('./features/localization/localization.component').then(m => m.LocalizationComponent) },
  { path: 'integraciones', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { anyFeature: ['integrations.googleMaps', 'integrations.whatsappBusiness', 'integrations.googleAnalytics', 'integrations.pushNotifications'], roles: ['operator', 'admin'] }, loadComponent: () => import('./features/integrations/integrations.component').then(m => m.IntegrationsComponent) },
  { path: 'contenido', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { feature: 'content.enabled', roles: ['operator', 'admin'] }, loadComponent: () => import('./features/content/content.component').then(m => m.ContentComponent) },
  { path: 'analitica', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { feature: 'analytics.enabled', roles: ['operator', 'admin'] }, loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: '', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { feature: 'operatorDashboard.enabled', roles: ['operator', 'admin'] }, loadComponent: () => import('./features/operator-dashboard/operator-dashboard.component').then(m => m.OperatorDashboardComponent) }
];
