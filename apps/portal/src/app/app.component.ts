import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonApp, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, bagOutline, compassOutline, heartOutline, homeOutline, mapOutline, searchOutline } from 'ionicons/icons';

import { TenantProductService } from '@viajes/tenant-config';
import { TravelStore } from './core/services/travel-store.service';

@Component({ selector: 'viajes-root', standalone: true, imports: [RouterLink, IonApp, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonToolbar], templateUrl: './app.component.html', styleUrl: './app.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class AppComponent {
  protected readonly tenant = inject(TenantProductService).config;
  protected readonly travelStore = inject(TravelStore);
  constructor() { addIcons({ arrowForwardOutline, bagOutline, compassOutline, heartOutline, homeOutline, mapOutline, searchOutline }); }
}
