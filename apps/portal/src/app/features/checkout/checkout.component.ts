import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { LocalReservation, TravelStore } from '../../core/services/travel-store.service';

@Component({ selector: 'viajes-checkout', standalone: true, imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon], templateUrl: './checkout.component.html', styleUrl: './checkout.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class CheckoutComponent {
  protected readonly travelStore = inject(TravelStore);
  protected readonly confirmation = signal<LocalReservation | undefined>(undefined);
  protected contactName = '';
  protected contactEmail = '';
  constructor() { addIcons({ checkmarkCircleOutline, lockClosedOutline }); }
  protected confirm(): void { if (!this.contactName.trim() || !this.contactEmail.includes('@')) return; this.confirmation.set(this.travelStore.confirmCart()); }
}
