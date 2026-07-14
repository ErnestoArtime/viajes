import { Routes } from '@angular/router';

import { featureEnabledGuard } from './core/guards/feature-enabled.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'buscar', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'destinos', loadComponent: () => import('./features/destinations/destinations.component').then(m => m.DestinationsComponent) },
  { path: 'oferta/:id', loadComponent: () => import('./features/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent) },
  { path: 'experiencias', canMatch: [featureEnabledGuard], data: { feature: 'travelerExperience.enabled' }, loadComponent: () => import('./features/traveler-experience/traveler-experience.component').then(m => m.TravelerExperienceComponent) },
  { path: 'viajes', loadComponent: () => import('./features/trips/trips.component').then(m => m.TripsComponent) },
  { path: 'transporte', canMatch: [featureEnabledGuard], data: { feature: 'transport.enabled' }, loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent) },
  { path: 'operator', loadChildren: () => import('./operator.routes').then(m => m.OPERATOR_ROUTES) },
  { path: '', loadChildren: () => import('./authenticated.routes').then(m => m.AUTHENTICATED_ROUTES) },
  { path: '**', redirectTo: '' }
];
