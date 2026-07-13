import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, heartOutline, trashOutline } from 'ionicons/icons';
import { TravelStore } from '../../core/services/travel-store.service';

@Component({ selector: 'viajes-trips', standalone: true, imports: [RouterLink, IonButton, IonContent, IonIcon], templateUrl: './trips.component.html', styleUrl: './trips.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class TripsComponent {
  protected readonly travelStore = inject(TravelStore);
  constructor() { addIcons({ calendarOutline, heartOutline, trashOutline }); }
  protected updateQuantity(id: string, quantity: number): void { this.travelStore.updateQuantity(id, quantity); }
}
