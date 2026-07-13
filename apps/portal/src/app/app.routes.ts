import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { featureEnabledGuard } from './core/guards/feature-enabled.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'buscar', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'destinos', loadComponent: () => import('./features/destinations/destinations.component').then(m => m.DestinationsComponent) },
  { path: 'oferta/:id', loadComponent: () => import('./features/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent) },
  { path: 'operator/features', canActivate: [authGuard, roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./admin/admin-features.component').then(m => m.AdminFeaturesComponent) },
  { path: 'operator/producto', canActivate: [authGuard, roleGuard], data: { roles: ['operator', 'admin'] }, loadComponent: () => import('./features/operator-product/operator-product.component').then(m => m.OperatorProductComponent) },
  { path: 'operator/reservas', canMatch: [featureEnabledGuard], canActivate: [authGuard], data: { feature: 'booking.enabled' }, loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent) },
  { path: 'operator/solicitudes', canActivate: [authGuard, roleGuard], data: { roles: ['operator', 'admin'] }, loadComponent: () => import('./features/operator-requests/operator-requests.component').then(m => m.OperatorRequestsComponent) },
  { path: 'operator', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { feature: 'operatorDashboard.enabled', roles: ['operator', 'admin'] }, loadComponent: () => import('./features/operator-dashboard/operator-dashboard.component').then(m => m.OperatorDashboardComponent) },
  { path: 'experiencias', canMatch: [featureEnabledGuard], data: { feature: 'travelerExperience.enabled' }, loadComponent: () => import('./features/traveler-experience/traveler-experience.component').then(m => m.TravelerExperienceComponent) },
  { path: 'operator/localizacion', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { anyFeature: ['multiLanguage.enabled', 'multiCurrency.enabled'], roles: ['operator', 'admin'] }, loadComponent: () => import('./features/localization/localization.component').then(m => m.LocalizationComponent) },
  { path: 'viajes', canActivate: [authGuard], loadComponent: () => import('./features/trips/trips.component').then(m => m.TripsComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'operator/integraciones', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { anyFeature: ['integrations.googleMaps', 'integrations.whatsappBusiness', 'integrations.googleAnalytics', 'integrations.pushNotifications'], roles: ['operator', 'admin'] }, loadComponent: () => import('./features/integrations/integrations.component').then(m => m.IntegrationsComponent) },
  { path: 'cuenta', canMatch: [featureEnabledGuard], data: { feature: 'auth.enabled' }, loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'transporte', canMatch: [featureEnabledGuard], data: { feature: 'transport.enabled' }, loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent) },
  { path: 'operator/contenido', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { feature: 'content.enabled', roles: ['operator', 'admin'] }, loadComponent: () => import('./features/content/content.component').then(m => m.ContentComponent) },
  { path: 'operator/analitica', canMatch: [featureEnabledGuard], canActivate: [authGuard, roleGuard], data: { feature: 'analytics.enabled', roles: ['operator', 'admin'] }, loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: '**', redirectTo: '' }
];
