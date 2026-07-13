import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  checkmarkCircleOutline,
  timeOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';
import { TravelListing } from '@viajes/domain';

import { BookingDraftItem, BookingDraftService } from '../../core/services/booking-draft.service';
import { QuoteRequestRepository } from '../../core/services/quote-request.repository';
import { canSubmitQuoteRequest } from '../../core/utils/quote-request.validation';

type BookingItem = BookingDraftItem;

@Component({
  selector: 'viajes-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonDatetime,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonTextarea,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="cart-outline"></ion-icon>
          Sistema de Reservas
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().booking.enabled) {
        @if (cartItems().length === 0) {
          <div class="empty-cart">
            <ion-icon name="cart-outline"></ion-icon>
            <h3>Tu carrito esta vacio</h3>
            <p>Explora nuestro catalogo y agrega alojamientos o servicios.</p>
            <ion-button routerLink="/home" fragment="catalogo">Volver al catalogo</ion-button>
          </div>
        } @else {
          <div class="booking-layout">
            <div class="cart-section">
                  <h2>Solicitud de viaje ({{ cartItems().length }})</h2>
              
              <ion-list>
                @for (item of cartItems(); track item.listing.id) {
                  <ion-card class="booking-item">
                    <div class="booking-item-content">
                      <img [src]="item.listing.imageUrl" [alt]="item.listing.name">
                      <div class="booking-details">
                        <h3>{{ item.listing.name }}</h3>
                        <p>{{ item.listing.location }}, {{ item.listing.province }}</p>
                        
                        <div class="date-inputs">
                          <ion-item>
                            <ion-label>Check-in</ion-label>
                            <ion-datetime 
                              [value]="item.checkIn"
                              (ionChange)="updateCheckIn(item.listing.id, $any($event.target).value)"
                              presentation="date"
                              [min]="minDate">
                            </ion-datetime>
                          </ion-item>
                          
                          <ion-item>
                            <ion-label>Check-out</ion-label>
                            <ion-datetime 
                              [value]="item.checkOut"
                              (ionChange)="updateCheckOut(item.listing.id, $any($event.target).value)"
                              presentation="date"
                              [min]="item.checkIn || minDate">
                            </ion-datetime>
                          </ion-item>
                          
                          <ion-item>
                            <ion-label>Huespedes</ion-label>
                            <ion-input 
                              type="number" 
                              [value]="item.guests"
                              (ionChange)="updateGuests(item.listing.id, +$any($event.target).value)"
                              [min]="1" 
                              [max]="item.listing.capacity">
                            </ion-input>
                          </ion-item>
                        </div>
                        
                        <div class="price-summary">
                          <span>{{ item.nights }} noches x {{ item.listing.nightlyPrice }} {{ item.listing.currency }}</span>
                          <strong>{{ item.listing.nightlyPrice * item.nights }} {{ item.listing.currency }}</strong>
                        </div>
                        
                        <ion-button 
                          fill="clear" 
                          color="danger" 
                          (click)="removeFromCart(item.listing.id)">
                          Eliminar
                        </ion-button>
                      </div>
                    </div>
                  </ion-card>
                }
              </ion-list>
            </div>

            <div class="payment-section">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Resumen de Pago</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="summary-row total">
                    <span>Estimacion inicial</span>
                    <strong>Desde {{ totalAmount() }} USD</strong>
                  </div>

                  <p class="estimate-note">Importe estimado. El operador confirmara disponibilidad, precio final y deposito.</p>

                  <h4>Datos de contacto</h4>
                  <ion-list>
                    <ion-item>
                      <ion-input label="Nombre completo" labelPlacement="stacked" [(ngModel)]="contactName" autocomplete="name" required></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-input label="Email" labelPlacement="stacked" type="email" [(ngModel)]="contactEmail" autocomplete="email" required></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-input label="Telefono o WhatsApp" labelPlacement="stacked" type="tel" [(ngModel)]="contactPhone" autocomplete="tel"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-textarea label="Comentarios" labelPlacement="stacked" [(ngModel)]="notes"></ion-textarea>
                    </ion-item>
                  </ion-list>

                  <div class="policy-info">
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    <div>
                      <strong>Politica de cancelacion {{ policyLabel() }}</strong>
                      <p>{{ policyDescription() }}</p>
                    </div>
                  </div>

                  <ion-button 
                    expand="block" 
                    size="large"
                    [disabled]="!canProceed() || isSubmitting()"
                    (click)="processBooking()">
                    <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
                    {{ isSubmitting() ? 'Enviando solicitud...' : 'Solicitar cotizacion' }}
                  </ion-button>
                  @if (submissionError()) {
                    <p class="submission-message error" role="alert">{{ submissionError() }}</p>
                  }
                  @if (submissionReference()) {
                    <p class="submission-message success" aria-live="polite">Solicitud enviada. Referencia: {{ submissionReference() }}</p>
                  }
                </ion-card-content>
              </ion-card>
            </div>
          </div>
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="cart-outline"></ion-icon>
          <h3>Modulo de Reservas No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .booking-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }
    
    .empty-cart, .feature-disabled {
      text-align: center;
      padding: 3rem;
      color: var(--ion-color-medium);
    }
    
    .empty-cart ion-icon, .feature-disabled ion-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .booking-item-content {
      display: flex;
      gap: 1rem;
    }
    
    .booking-item-content img {
      width: 120px;
      height: 90px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .booking-details {
      flex: 1;
    }
    
    .date-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    
    .price-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--ion-color-light);
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
    }
    
    .summary-row.total {
      font-size: 1.2rem;
      padding-top: 0.5rem;
      border-top: 2px solid var(--ion-color-primary);
    }
    
    .policy-info {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      margin: 1rem 0;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    
    .policy-info p {
      margin: 0;
      font-size: 0.9rem;
    }

    .estimate-note {
      color: var(--ion-color-medium-shade);
      font-size: 0.9rem;
    }

    .submission-message { margin: 1rem 0 0; }
    .submission-message.error { color: var(--ion-color-danger); }
    .submission-message.success { color: var(--ion-color-success-shade); }
    
    ion-item.selected {
      --background: var(--ion-color-primary-tint);
    }
  `]
})
export class BookingComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  private readonly bookingDraft = inject(BookingDraftService);
  private readonly quoteRequests = inject(QuoteRequestRepository);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  
  protected readonly cartItems = this.bookingDraft.items;
  protected readonly isSubmitting = signal(false);
  protected readonly submissionError = signal<string | null>(null);
  protected readonly submissionReference = signal<string | null>(null);
  protected readonly minDate = new Date().toISOString().split('T')[0];
  protected contactName = '';
  protected contactEmail = '';
  protected contactPhone = '';
  protected notes = '';

  protected readonly totalAmount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.listing.nightlyPrice * item.nights, 0);
  });

  protected readonly policyLabel = computed(() => {
    const policy = this.featureFlags().booking.cancellationPolicy;
    const labels = { flexible: 'Flexible', moderate: 'Moderada', strict: 'Estricta' };
    return labels[policy];
  });

  protected readonly policyDescription = computed(() => {
    const policy = this.featureFlags().booking.cancellationPolicy;
    const descriptions = {
      flexible: 'Cancelacion gratuita hasta 24 horas antes del check-in.',
      moderate: 'Cancelacion gratuita hasta 7 dias antes del check-in.',
      strict: 'Reembolso del 50% hasta 14 dias antes del check-in.'
    };
    return descriptions[policy];
  });

  constructor() {
    addIcons({
      cartOutline,
      checkmarkCircleOutline,
      timeOutline,
      shieldCheckmarkOutline
    });
  }

  addToCart(listing: TravelListing): void {
    this.bookingDraft.add(listing);
  }

  removeFromCart(listingId: string): void {
    this.bookingDraft.remove(listingId);
  }

  updateCheckIn(listingId: string, date: string): void {
    this.updateCartItem(listingId, { checkIn: date });
    this.recalculatePrice(listingId);
  }

  updateCheckOut(listingId: string, date: string): void {
    this.updateCartItem(listingId, { checkOut: date });
    this.recalculatePrice(listingId);
  }

  updateGuests(listingId: string, guests: number): void {
    const item = this.cartItems().find((candidate) => candidate.listing.id === listingId);
    if (item) {
      this.updateCartItem(listingId, { guests: Math.min(item.listing.capacity, Math.max(1, guests)) });
    }
  }

  canProceed(): boolean {
    return canSubmitQuoteRequest(
      this.cartItems().map((item) => ({ ...item, capacity: item.listing.capacity })),
      this.contactName,
      this.contactEmail
    );
  }

  async processBooking(): Promise<void> {
    if (!this.canProceed() || this.isSubmitting()) {
      return;
    }

    const items = this.cartItems();
    this.isSubmitting.set(true);
    this.submissionError.set(null);
    try {
      const submitted = await this.quoteRequests.submit({
        checkIn: items[0].checkIn,
        checkOut: items[0].checkOut,
        adults: items.reduce((total, item) => total + item.guests, 0),
        children: 0,
        rooms: items.length,
        contactName: this.contactName.trim(),
        contactEmail: this.contactEmail.trim(),
        contactPhone: this.contactPhone.trim() || undefined,
        notes: this.notes.trim() || undefined,
        items: items.map((item) => ({ listingId: item.listing.id, quantity: 1 }))
      });
      this.submissionReference.set(submitted.reference);
      this.bookingDraft.clear();
    } catch (error) {
      this.submissionError.set(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private updateCartItem(listingId: string, updates: Partial<Omit<BookingItem, 'listing'>>): void {
    this.bookingDraft.update(listingId, updates);
  }

  private recalculatePrice(listingId: string): void {
    const item = this.cartItems().find((candidate) => candidate.listing.id === listingId);
    if (!item || !item.checkIn || !item.checkOut || item.checkOut <= item.checkIn) {
      return;
    }
    const nights = Math.ceil((new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / 86_400_000);
    this.bookingDraft.update(listingId, { nights });
  }
}
