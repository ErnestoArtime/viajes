import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, compassOutline, locationOutline, searchOutline, star } from 'ionicons/icons';

import { servicePackages, travelListings } from '@viajes/domain';

@Component({
  selector: 'viajes-home',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected readonly listings = travelListings;
  protected readonly packages = servicePackages;
  protected destination = '';
  protected guests = 2;

  constructor() {
    addIcons({ chevronForwardOutline, compassOutline, locationOutline, searchOutline, star });
  }
}
