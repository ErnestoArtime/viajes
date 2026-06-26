import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonRouterOutlet,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  carOutline,
  cartOutline,
  compassOutline,
  documentTextOutline,
  globeOutline,
  homeOutline,
  pulseOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  trophyOutline
} from 'ionicons/icons';

import { defaultTenantBranding, FeatureFlagsService } from '@viajes/tenant-config';

@Component({
  selector: 'viajes-root',
  standalone: true,
  imports: [
    RouterLink,
    IonApp,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonRouterOutlet,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);

  protected readonly tenant = defaultTenantBranding;
  protected readonly features = this.featureFlagsService.flags;

  constructor() {
    addIcons({
      analyticsOutline,
      carOutline,
      cartOutline,
      compassOutline,
      documentTextOutline,
      globeOutline,
      homeOutline,
      pulseOutline,
      settingsOutline,
      shieldCheckmarkOutline,
      trophyOutline
    });
  }
}
