import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, bagOutline, compassOutline, heartOutline, homeOutline, mapOutline, menuOutline, searchOutline } from 'ionicons/icons';

import { TenantProductService } from '@viajes/tenant-config';
import { TravelStore } from './core/services/travel-store.service';

@Component({ selector: 'viajes-root', standalone: true, imports: [RouterLink, IonApp, IonIcon, IonRouterOutlet], templateUrl: './app.component.html', styleUrl: './app.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class AppComponent {
  protected readonly tenant = inject(TenantProductService).config;
  protected readonly travelStore = inject(TravelStore);
  protected readonly menuOpen = signal(false);
  constructor() { addIcons({ arrowForwardOutline, bagOutline, compassOutline, heartOutline, homeOutline, mapOutline, menuOutline, searchOutline }); }
  protected toggleMenu(): void { this.menuOpen.update((open) => !open); }
  protected closeMenu(): void { this.menuOpen.set(false); }
}
