import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  checkmarkCircleOutline,
  cardOutline,
  cashOutline,
  timeOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';
import { TravelListing } from '@viajes/domain';

interface BookingItem {
  listing: TravelListing;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

@Component({
  selector: 'viajes-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonContent,
    IonDatetime,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
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
          </div>
        } @else {
          <div class="booking-layout">
            <div class="cart-section">
              <h2>Carrito de Reservas ({{ cartItems().length }})</h2>
              
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
                          <strong>{{ item.totalPrice }} {{ item.listing.currency }}</strong>
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
                  <div class="summary-row">
                    <span>Subtotal</span>
                    <strong>{{ totalAmount() }} USD</strong>
                  </div>
                  <div class="summary-row">
                    <span>Impuestos (10%)</span>
                    <strong>{{ taxAmount() }} USD</strong>
                  </div>
                  <div class="summary-row total">
                    <span>Total</span>
                    <strong>{{ totalWithTax() }} USD</strong>
                  </div>

                  <h4>Metodo de Pago</h4>
                  <ion-list>
                    @for (method of paymentMethods(); track method.id) {
                      <ion-item 
                        [class.selected]="selectedPayment() === method.id"
                        (click)="selectPayment(method.id)"
                        [disabled]="!method.available">
                        <ion-icon [name]="method.icon" slot="start"></ion-icon>
                        <ion-label>{{ method.name }}</ion-label>
                        @if (!method.available) {
                          <ion-chip color="medium">No disponible</ion-chip>
                        }
                      </ion-item>
                    }
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
                    [disabled]="!canProceed()"
                    (click)="processBooking()">
                    <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
                    Confirmar Reserva
                  </ion-button>
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
    
    ion-item.selected {
      --background: var(--ion-color-primary-tint);
    }
  `]
})
export class BookingComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  
  protected readonly cartItems = signal<BookingItem[]>([]);
  protected readonly selectedPayment = signal<string>('paypal');
  protected readonly minDate = new Date().toISOString().split('T')[0];

  protected readonly paymentMethods = computed<PaymentMethod[]>(() => {
    const gateway = this.featureFlags().booking.paymentGateway;
    return [
      { id: 'paypal', name: 'PayPal', icon: 'card-outline', available: gateway === 'paypal' || gateway === 'none' },
      { id: 'stripe', name: 'Tarjeta de Credito/Debito', icon: 'card-outline', available: gateway === 'stripe' },
      { id: 'transfer', name: 'Transferencia Bancaria', icon: 'cash-outline', available: gateway === 'transfer' },
      { id: 'crypto', name: 'Criptomonedas', icon: 'cash-outline', available: gateway === 'crypto' }
    ];
  });

  protected readonly totalAmount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0);
  });

  protected readonly taxAmount = computed(() => {
    return this.totalAmount() * 0.1;
  });

  protected readonly totalWithTax = computed(() => {
    return this.totalAmount() + this.taxAmount();
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
      cardOutline,
      cashOutline,
      timeOutline,
      shieldCheckmarkOutline
    });
  }

  addToCart(listing: TravelListing): void {
    const checkIn = this.minDate;
    const checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const nights = 1;
    
    this.cartItems.update(items => [
      ...items,
      {
        listing,
        checkIn,
        checkOut,
        guests: 2,
        nights,
        totalPrice: listing.nightlyPrice * nights
      }
    ]);
  }

  removeFromCart(listingId: string): void {
    this.cartItems.update(items => items.filter(item => item.listing.id !== listingId));
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
    this.updateCartItem(listingId, { guests });
  }

  selectPayment(methodId: string): void {
    this.selectedPayment.set(methodId);
  }

  canProceed(): boolean {
    return this.cartItems().length > 0 && 
           this.selectedPayment() !== '' &&
           this.cartItems().every(item => item.checkIn && item.checkOut);
  }

  processBooking(): void {
    if (!this.canProceed()) return;
    
    const booking = {
      items: this.cartItems(),
      paymentMethod: this.selectedPayment(),
      total: this.totalWithTax(),
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
    
    console.log('Processing booking:', booking);
    alert('Reserva procesada exitosamente!');
    this.cartItems.set([]);
  }

  private updateCartItem(listingId: string, updates: Partial<BookingItem>): void {
    this.cartItems.update(items =>
      items.map(item =>
        item.listing.id === listingId ? { ...item, ...updates } : item
      )
    );
  }

  private recalculatePrice(listingId: string): void {
    this.cartItems.update(items =>
      items.map(item => {
        if (item.listing.id === listingId && item.checkIn && item.checkOut) {
          const nights = Math.max(1, Math.ceil(
            (new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / 86400000
          ));
          return {
            ...item,
            nights,
            totalPrice: item.listing.nightlyPrice * nights
          };
        }
        return item;
      })
    );
  }
}
