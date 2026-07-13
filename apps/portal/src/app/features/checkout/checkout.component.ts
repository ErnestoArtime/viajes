import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { QuoteRequestRepository } from '../../core/services/quote-request.repository';
import { canSubmitQuoteRequest } from '../../core/utils/quote-request.validation';
import { TravelStore } from '../../core/services/travel-store.service';

@Component({ selector: 'viajes-checkout', standalone: true, imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon], templateUrl: './checkout.component.html', styleUrl: './checkout.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class CheckoutComponent {
  protected readonly travelStore = inject(TravelStore);
  private readonly quoteRequests = inject(QuoteRequestRepository);
  protected readonly confirmation = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected contactName = '';
  protected contactEmail = '';
  protected contactPhone = '';
  protected notes = '';
  protected checkIn = new Date().toISOString().slice(0, 10);
  protected checkOut = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  protected guests = 1;
  protected rooms = 1;
  protected readonly canSubmit = computed(() => canSubmitQuoteRequest(
    this.travelStore.cart().map((item) => ({ checkIn: this.checkIn, checkOut: this.checkOut, guests: this.guests, capacity: item.listing.capacity })),
    this.contactName,
    this.contactEmail
  ));
  constructor() { addIcons({ checkmarkCircleOutline, lockClosedOutline }); }
  protected async confirm(): Promise<void> {
    if (!this.canSubmit() || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      const submitted = await this.quoteRequests.submit({
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.guests,
        children: 0,
        rooms: this.rooms,
        contactName: this.contactName.trim(),
        contactEmail: this.contactEmail.trim(),
        contactPhone: this.contactPhone.trim() || undefined,
        notes: this.notes.trim() || undefined,
        items: this.travelStore.cart().map((item) => ({ listingId: item.listingId, quantity: item.quantity }))
      });
      this.travelStore.clearCart();
      this.confirmation.set(submitted.reference);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    } finally {
      this.submitting.set(false);
    }
  }
}
