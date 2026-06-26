import { Routes } from '@angular/router';

import { featureEnabledGuard } from './core/guards/feature-enabled.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'admin/features',
    loadComponent: () => import('./admin/admin-features.component').then(m => m.AdminFeaturesComponent)
  },
  {
    path: 'features/booking',
    canMatch: [featureEnabledGuard],
    data: { feature: 'booking.enabled' },
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'features/dashboard',
    canMatch: [featureEnabledGuard],
    data: { feature: 'operatorDashboard.enabled' },
    loadComponent: () => import('./features/operator-dashboard/operator-dashboard.component').then(m => m.OperatorDashboardComponent)
  },
  {
    path: 'features/experience',
    canMatch: [featureEnabledGuard],
    data: { feature: 'travelerExperience.enabled' },
    loadComponent: () => import('./features/traveler-experience/traveler-experience.component').then(m => m.TravelerExperienceComponent)
  },
  {
    path: 'features/localization',
    canMatch: [featureEnabledGuard],
    data: { anyFeature: ['multiLanguage.enabled', 'multiCurrency.enabled'] },
    loadComponent: () => import('./features/localization/localization.component').then(m => m.LocalizationComponent)
  },
  {
    path: 'features/loyalty',
    canMatch: [featureEnabledGuard],
    data: { feature: 'loyalty.enabled' },
    loadComponent: () => import('./features/loyalty/loyalty.component').then(m => m.LoyaltyComponent)
  },
  {
    path: 'features/integrations',
    canMatch: [featureEnabledGuard],
    data: {
      anyFeature: [
        'integrations.googleMaps',
        'integrations.whatsappBusiness',
        'integrations.googleAnalytics',
        'integrations.pushNotifications'
      ]
    },
    loadComponent: () => import('./features/integrations/integrations.component').then(m => m.IntegrationsComponent)
  },
  {
    path: 'features/auth',
    canMatch: [featureEnabledGuard],
    data: { feature: 'auth.enabled' },
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'features/transport',
    canMatch: [featureEnabledGuard],
    data: { feature: 'transport.enabled' },
    loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent)
  },
  {
    path: 'features/content',
    canMatch: [featureEnabledGuard],
    data: { feature: 'content.enabled' },
    loadComponent: () => import('./features/content/content.component').then(m => m.ContentComponent)
  },
  {
    path: 'features/analytics',
    canMatch: [featureEnabledGuard],
    data: { feature: 'analytics.enabled' },
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
