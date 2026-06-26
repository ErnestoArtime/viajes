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
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  carOutline,
  carSportOutline,
  bicycleOutline,
  airplaneOutline,
  timeOutline,
  locationOutline,
  peopleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';

interface TransportOption {
  id: string;
  type: 'taxi' | 'shared' | 'car-rental' | 'airport-transfer';
  name: string;
  description: string;
  price: number;
  currency: string;
  capacity: number;
  duration: string;
  features: string[];
  available: boolean;
}

interface TransportBooking {
  id: string;
  option: TransportOption;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  passengers: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed';
}

@Component({
  selector: 'viajes-transport',
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
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="car-outline"></ion-icon>
          Modulo de Transporte
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().transport.enabled) {
        <ion-segment [value]="activeTab()" (ionChange)="updateTab($event.detail.value)">
          <ion-segment-button value="search">
            <ion-label>Buscar</ion-label>
          </ion-segment-button>
          <ion-segment-button value="bookings">
            <ion-label>Mis Reservas</ion-label>
          </ion-segment-button>
        </ion-segment>

        @switch (activeTab()) {
          @case ('search') {
            <div class="search-section">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Encuentra tu transporte</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-list>
                    <ion-item>
                      <ion-icon name="location-outline" slot="start"></ion-icon>
                      <ion-input 
                        placeholder="Direccion de recogida"
                        [(ngModel)]="pickupAddress">
                      </ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-icon name="location-outline" slot="start"></ion-icon>
                      <ion-input 
                        placeholder="Direccion de destino"
                        [(ngModel)]="dropoffAddress">
                      </ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-icon name="time-outline" slot="start"></ion-icon>
                      <ion-datetime 
                        presentation="date-time"
                        [(ngModel)]="selectedDate">
                      </ion-datetime>
                    </ion-item>
                    <ion-item>
                      <ion-icon name="people-outline" slot="start"></ion-icon>
                      <ion-input 
                        type="number" 
                        placeholder="Pasajeros"
                        [(ngModel)]="passengers"
                        [min]="1" 
                        [max]="8">
                      </ion-input>
                    </ion-item>
                  </ion-list>

                  <ion-button expand="block" (click)="searchTransport()">
                    Buscar Disponibilidad
                  </ion-button>
                </ion-card-content>
              </ion-card>

              @if (searchResults().length > 0) {
                <div class="results-section">
                  <h3>Opciones Disponibles</h3>
                  
                  <div class="transport-grid">
                    @for (option of searchResults(); track option.id) {
                      <ion-card class="transport-card" [class.disabled]="!option.available">
                        <ion-card-header>
                          <ion-card-title>{{ option.name }}</ion-card-title>
                          <ion-chip [color]="getTransportColor(option.type)">
                            {{ getTransportLabel(option.type) }}
                          </ion-chip>
                        </ion-card-header>
                        <ion-card-content>
                          <p>{{ option.description }}</p>
                          
                          <div class="transport-details">
                            <div class="detail">
                              <ion-icon name="people-outline"></ion-icon>
                              <span>Hasta {{ option.capacity }} pasajeros</span>
                            </div>
                            <div class="detail">
                              <ion-icon name="time-outline"></ion-icon>
                              <span>{{ option.duration }}</span>
                            </div>
                          </div>

                          <div class="features-list">
                            @for (feature of option.features; track feature) {
                              <ion-chip outline>
                                <ion-icon name="checkmark-circle-outline"></ion-icon>
                                {{ feature }}
                              </ion-chip>
                            }
                          </div>

                          <div class="price-action">
                            <div class="price">
                              <span class="amount">{{ option.price }}</span>
                              <span class="currency">{{ option.currency }}</span>
                            </div>
                            <ion-button 
                              [disabled]="!option.available"
                              (click)="bookTransport(option)">
                              Reservar
                            </ion-button>
                          </div>
                        </ion-card-content>
                      </ion-card>
                    }
                  </div>
                </div>
              }
            </div>
          }

          @case ('bookings') {
            <div class="bookings-section">
              <h3>Mis Reservas de Transporte</h3>
              
              @if (myBookings().length === 0) {
                <div class="empty-state">
                  <ion-icon name="car-outline"></ion-icon>
                  <p>No tienes reservas de transporte aun.</p>
                  <ion-button fill="outline" (click)="activeTab.set('search')">
                    Buscar Transporte
                  </ion-button>
                </div>
              } @else {
                <ion-list>
                  @for (booking of myBookings(); track booking.id) {
                    <ion-card class="booking-card">
                      <ion-card-content>
                        <div class="booking-header">
                          <div class="booking-type">
                            <ion-icon [name]="getTransportIcon(booking.option.type)"></ion-icon>
                            <span>{{ booking.option.name }}</span>
                          </div>
                          <ion-chip [color]="getBookingStatusColor(booking.status)">
                            {{ getBookingStatusLabel(booking.status) }}
                          </ion-chip>
                        </div>

                        <div class="booking-route">
                          <div class="route-point">
                            <ion-icon name="location-outline"></ion-icon>
                            <span>{{ booking.pickupLocation }}</span>
                          </div>
                          <div class="route-line"></div>
                          <div class="route-point">
                            <ion-icon name="location-outline"></ion-icon>
                            <span>{{ booking.dropoffLocation }}</span>
                          </div>
                        </div>

                        <div class="booking-details">
                          <span>{{ booking.date }} a las {{ booking.time }}</span>
                          <span>{{ booking.passengers }} pasajeros</span>
                          <span class="price">{{ booking.totalPrice }} {{ booking.option.currency }}</span>
                        </div>
                      </ion-card-content>
                    </ion-card>
                  }
                </ion-list>
              }
            </div>
          }
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="car-outline"></ion-icon>
          <h3>Transporte No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .search-section {
      display: grid;
      gap: 1rem;
    }
    
    .results-section {
      margin-top: 1rem;
    }
    
    .results-section h3 {
      margin-bottom: 1rem;
    }
    
    .transport-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .transport-card.disabled {
      opacity: 0.6;
    }
    
    .transport-card ion-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .transport-details {
      display: flex;
      gap: 1.5rem;
      margin: 1rem 0;
    }
    
    .detail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    
    .price-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--ion-color-light);
    }
    
    .price .amount {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .price .currency {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--ion-color-medium);
    }
    
    .empty-state ion-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .booking-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: bold;
    }
    
    .booking-route {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1rem 0;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    
    .route-point {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .route-line {
      flex: 1;
      height: 2px;
      background: var(--ion-color-primary);
      position: relative;
    }
    
    .route-line::before {
      content: '';
      position: absolute;
      left: 0;
      top: -4px;
      width: 10px;
      height: 10px;
      background: var(--ion-color-primary);
      border-radius: 50%;
    }
    
    .route-line::after {
      content: '';
      position: absolute;
      right: 0;
      top: -4px;
      width: 10px;
      height: 10px;
      background: var(--ion-color-primary);
      border-radius: 50%;
    }
    
    .booking-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }
    
    .booking-details .price {
      font-weight: bold;
      color: var(--ion-color-primary);
    }
    
    .feature-disabled {
      text-align: center;
      padding: 3rem;
      color: var(--ion-color-medium);
    }
    
    .feature-disabled ion-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  `]
})
export class TransportComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly activeTab = signal<'search' | 'bookings'>('search');

  protected pickupAddress = '';
  protected dropoffAddress = '';
  protected selectedDate = new Date().toISOString();
  protected passengers = 2;

  protected readonly searchResults = signal<TransportOption[]>([]);
  protected readonly myBookings = signal<TransportBooking[]>([]);

  constructor() {
    addIcons({
      carOutline,
  carSportOutline,
      bicycleOutline,
      airplaneOutline,
      timeOutline,
      locationOutline,
      peopleOutline,
      checkmarkCircleOutline
    });
  }

  updateTab(value: string | number | undefined): void {
    if (value === 'search' || value === 'bookings') {
      this.activeTab.set(value);
    }
  }

  searchTransport(): void {
    const results: TransportOption[] = [];

    if (this.featureFlags().transport.privateTaxi) {
      results.push({
        id: '1',
        type: 'taxi',
        name: 'Taxi Privado',
        description: 'Vehiculo exclusivo con conductor profesional',
        price: 25,
        currency: 'USD',
        capacity: 4,
        duration: '30-45 min',
        features: ['Wi-Fi', 'Agua', 'Aire acondicionado'],
        available: true
      });
    }

    if (this.featureFlags().transport.sharedTransport) {
      results.push({
        id: '2',
        type: 'shared',
        name: 'Transporte Compartido',
        description: 'Comparte viaje con otros viajeros',
        price: 10,
        currency: 'USD',
        capacity: 8,
        duration: '45-60 min',
        features: ['Economico', 'Eco-friendly'],
        available: true
      });
    }

    if (this.featureFlags().transport.carRental) {
      results.push({
        id: '3',
        type: 'car-rental',
        name: 'Alquiler de Auto',
        description: 'Conduce tu propio vehiculo',
        price: 45,
        currency: 'USD',
        capacity: 5,
        duration: 'Por dia',
        features: ['Seguro incluido', 'Kilometraje ilimitado', 'Soporte 24/7'],
        available: true
      });
    }

    if (this.featureFlags().transport.airportTransfer) {
      results.push({
        id: '4',
        type: 'airport-transfer',
        name: 'Traslado Aeropuerto',
        description: 'Servicio puerta a puerta desde/hacia el aeropuerto',
        price: 35,
        currency: 'USD',
        capacity: 4,
        duration: '30-40 min',
        features: ['Monitoreo de vuelos', 'Espera gratuita 60min', 'Señal con tu nombre'],
        available: true
      });
    }

    this.searchResults.set(results);
  }

  bookTransport(option: TransportOption): void {
    const booking: TransportBooking = {
      id: Date.now().toString(),
      option,
      pickupLocation: this.pickupAddress || 'Direccion por confirmar',
      dropoffLocation: this.dropoffAddress || 'Direccion por confirmar',
      date: new Date(this.selectedDate).toLocaleDateString('es-ES'),
      time: new Date(this.selectedDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      passengers: this.passengers,
      totalPrice: option.price,
      status: 'confirmed'
    };

    this.myBookings.update(bookings => [...bookings, booking]);
    this.searchResults.set([]);
    alert('Reserva confirmada!');
  }

  getTransportColor(type: string): string {
    const colors: Record<string, string> = {
      taxi: 'primary',
      shared: 'secondary',
      'car-rental': 'tertiary',
      'airport-transfer': 'warning'
    };
    return colors[type] || 'primary';
  }

  getTransportLabel(type: string): string {
    const labels: Record<string, string> = {
      taxi: 'Taxi',
      shared: 'Compartido',
      'car-rental': 'Alquiler',
      'airport-transfer': 'Traslado'
    };
    return labels[type] || type;
  }

  getTransportIcon(type: string): string {
    const icons: Record<string, string> = {
      taxi: 'car-outline',
      shared: 'people-outline',
      'car-rental': 'car-outline',
      'airport-transfer': 'airplane-outline'
    };
    return icons[type] || 'car-outline';
  }

  getBookingStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'medium'
    };
    return colors[status] || 'medium';
  }

  getBookingStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada'
    };
    return labels[status] || status;
  }
}
