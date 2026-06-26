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
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  compassOutline,
  chatbubbleOutline,
  starOutline,
  mapOutline,
  timeOutline,
  locationOutline,
  createOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';
import { TravelListing } from '@viajes/domain';

interface Itinerary {
  id: string;
  title: string;
  description: string;
  duration: string;
  days: ItineraryDay[];
  totalPrice: number;
  rating: number;
  reviewCount: number;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'host';
  message: string;
  timestamp: Date;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

@Component({
  selector: 'viajes-traveler-experience',
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
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonTextarea,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="compass-outline"></ion-icon>
          Experiencias del Viajero
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().travelerExperience.enabled) {
        <ion-segment [value]="activeTab()" (ionChange)="updateTab($event.detail.value)">
          <ion-segment-button value="itineraries">
            <ion-label>Itinerarios</ion-label>
          </ion-segment-button>
          <ion-segment-button value="chat">
            <ion-label>Chat</ion-label>
          </ion-segment-button>
          <ion-segment-button value="reviews">
            <ion-label>Resenas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="guide">
            <ion-label>Guia</ion-label>
          </ion-segment-button>
        </ion-segment>

        @switch (activeTab()) {
          @case ('itineraries') {
            @if (featureFlags().travelerExperience.itineraries) {
              <div class="itineraries-section">
                <h2>Itinerarios Personalizados</h2>
                <p>Crea tu viaje perfecto con nuestras rutas recomendadas.</p>

                <div class="itinerary-grid">
                  @for (itinerary of itineraries(); track itinerary.id) {
                    <ion-card class="itinerary-card">
                      <ion-card-header>
                        <ion-card-title>{{ itinerary.title }}</ion-card-title>
                        <div class="itinerary-meta">
                          <ion-chip>
                            <ion-icon name="time-outline"></ion-icon>
                            {{ itinerary.duration }}
                          </ion-chip>
                          <ion-chip color="primary">
                            {{ itinerary.totalPrice }} USD
                          </ion-chip>
                        </div>
                      </ion-card-header>
                      <ion-card-content>
                        <p>{{ itinerary.description }}</p>
                        
                        <div class="itinerary-rating">
                          <ion-icon name="star-outline"></ion-icon>
                          <span>{{ itinerary.rating }} ({{ itinerary.reviewCount }} resenas)</span>
                        </div>

                        <div class="itinerary-days">
                          @for (day of itinerary.days; track day.day) {
                            <div class="day-preview">
                              <strong>Dia {{ day.day }}</strong>
                              <span>{{ day.title }}</span>
                            </div>
                          }
                        </div>

                        <ion-button expand="block" (click)="selectItinerary(itinerary)">
                          Ver Detalles
                        </ion-button>
                      </ion-card-content>
                    </ion-card>
                  }
                </div>

                @if (selectedItinerary()) {
                  <div class="itinerary-detail">
                    <h3>{{ selectedItinerary()!.title }}</h3>
                    
                    @for (day of selectedItinerary()!.days; track day.day) {
                      <div class="day-schedule">
                        <h4>Dia {{ day.day }}: {{ day.title }}</h4>
                        <ion-list>
                          @for (activity of day.activities; track activity.time) {
                            <ion-item>
                              <ion-icon name="time-outline" slot="start"></ion-icon>
                              <ion-label>
                                <h5>{{ activity.time }} - {{ activity.title }}</h5>
                                <p>{{ activity.description }}</p>
                                <p class="location">
                                  <ion-icon name="location-outline"></ion-icon>
                                  {{ activity.location }} ({{ activity.duration }})
                                </p>
                              </ion-label>
                            </ion-item>
                          }
                        </ion-list>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }

          @case ('chat') {
            @if (featureFlags().travelerExperience.chatWithHosts) {
              <div class="chat-section">
                <h2>Chat con Anfitriones</h2>
                <p>Comunícate directamente con los dueños de las propiedades.</p>

                <div class="chat-container">
                  <div class="chat-messages">
                    @for (message of chatMessages(); track message.id) {
                      <div class="message" [class]="message.sender">
                        <div class="message-content">
                          <p>{{ message.message }}</p>
                          <span class="timestamp">{{ message.timestamp | date:'short' }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="chat-input">
                    <ion-textarea 
                      [(ngModel)]="newMessage"
                      placeholder="Escribe tu mensaje..."
                      rows="2">
                    </ion-textarea>
                    <ion-button (click)="sendMessage()">
                      <ion-icon name="create-outline" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </div>
            }
          }

          @case ('reviews') {
            @if (featureFlags().travelerExperience.verifiedReviews) {
              <div class="reviews-section">
                <h2>Resenas Verificadas</h2>
                <p>Opiniones reales de viajeros que han estado aqui.</p>

                <div class="reviews-stats">
                  <div class="rating-summary">
                    <span class="average-rating">4.8</span>
                    <div class="stars">
                      @for (star of [1,2,3,4,5]; track star) {
                        <ion-icon name="star-outline" [class.filled]="star <= 4"></ion-icon>
                      }
                    </div>
                    <span>{{ reviews().length }} resenas verificadas</span>
                  </div>
                </div>

                <ion-list>
                  @for (review of reviews(); track review.id) {
                    <ion-card class="review-card">
                      <ion-card-content>
                        <div class="review-header">
                          <div class="reviewer-info">
                            <strong>{{ review.userName }}</strong>
                            @if (review.verified) {
                              <ion-chip color="success" class="verified-badge">
                                Verificada
                              </ion-chip>
                            }
                          </div>
                          <div class="review-rating">
                            @for (star of [1,2,3,4,5]; track star) {
                              <ion-icon name="star-outline" [class.filled]="star <= review.rating"></ion-icon>
                            }
                          </div>
                        </div>
                        <p class="review-comment">{{ review.comment }}</p>
                        <span class="review-date">{{ review.date | date:'mediumDate' }}</span>
                      </ion-card-content>
                    </ion-card>
                  }
                </ion-list>
              </div>
            }
          }

          @case ('guide') {
            @if (featureFlags().travelerExperience.offlineGuide) {
              <div class="guide-section">
                <h2>Guia de Destinos</h2>
                <p>Informacion util para tu viaje, disponible sin conexion.</p>

                <div class="guide-categories">
                  <ion-button fill="outline">
                    <ion-icon name="map-outline" slot="start"></ion-icon>
                    Mapas
                  </ion-button>
                  <ion-button fill="outline">
                    <ion-icon name="compass-outline" slot="start"></ion-icon>
                    Rutas
                  </ion-button>
                  <ion-button fill="outline">
                    <ion-icon name="location-outline" slot="start"></ion-icon>
                    Lugares
                  </ion-button>
                </div>

                <ion-list>
                  @for (guideItem of guideItems(); track guideItem.id) {
                    <ion-item>
                      <ion-icon [name]="guideItem.icon" slot="start"></ion-icon>
                      <ion-label>
                        <h3>{{ guideItem.title }}</h3>
                        <p>{{ guideItem.description }}</p>
                      </ion-label>
                      <ion-button fill="clear" slot="end">
                        Ver
                      </ion-button>
                    </ion-item>
                  }
                </ion-list>
              </div>
            }
          }
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="compass-outline"></ion-icon>
          <h3>Experiencias No Disponibles</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .itinerary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .itinerary-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .itinerary-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
      color: var(--ion-color-warning);
    }
    
    .itinerary-days {
      margin: 1rem 0;
    }
    
    .day-preview {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--ion-color-light);
    }
    
    .itinerary-detail {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    
    .day-schedule {
      margin-bottom: 1.5rem;
    }
    
    .day-schedule h4 {
      margin-bottom: 0.5rem;
      color: var(--ion-color-primary);
    }
    
    .location {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 400px;
      border: 1px solid var(--ion-color-light);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .message {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 12px;
    }
    
    .message.user {
      align-self: flex-end;
      background: var(--ion-color-primary);
      color: white;
    }
    
    .message.host {
      align-self: flex-start;
      background: var(--ion-color-light);
    }
    
    .timestamp {
      font-size: 0.7rem;
      opacity: 0.7;
    }
    
    .chat-input {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      border-top: 1px solid var(--ion-color-light);
    }
    
    .chat-input ion-textarea {
      flex: 1;
    }
    
    .reviews-stats {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    
    .rating-summary {
      text-align: center;
    }
    
    .average-rating {
      font-size: 3rem;
      font-weight: bold;
    }
    
    .stars {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      margin: 0.5rem 0;
    }
    
    .stars ion-icon.filled {
      color: var(--ion-color-warning);
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .review-rating ion-icon.filled {
      color: var(--ion-color-warning);
    }
    
    .review-comment {
      margin: 0.5rem 0;
    }
    
    .review-date {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
    }
    
    .guide-categories {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
      flex-wrap: wrap;
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
export class TravelerExperienceComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly activeTab = signal<string>('itineraries');
  protected readonly selectedItinerary = signal<Itinerary | null>(null);
  protected readonly newMessage = signal('');

  protected readonly itineraries = signal<Itinerary[]>([
    {
      id: '1',
      title: 'Habana Colonial y Cultural',
      description: 'Recorrido por la historia y cultura de La Habana vieja.',
      duration: '3 dias',
      totalPrice: 145,
      rating: 4.8,
      reviewCount: 124,
      days: [
        {
          day: 1,
          title: 'Llegada y Paseo del Prado',
          activities: [
            {
              time: '10:00',
              title: 'Llegada al aeropuerto',
              description: 'Traslado privado al hotel',
              location: 'Aeropuerto Jose Marti',
              duration: '45 min'
            },
            {
              time: '14:00',
              title: 'Tour peatonal La Habana Vieja',
              description: 'Recorrido por las principales atracciones',
              location: 'Plaza de la Catedral',
              duration: '3 horas'
            }
          ]
        },
        {
          day: 2,
          title: 'Arte y Tradiciones',
          activities: [
            {
              time: '09:00',
              title: 'Visita al Museo de la Revolucion',
              description: 'Conocer la historia revolucionaria',
              location: 'Museo de la Revolucion',
              duration: '2 horas'
            },
            {
              time: '15:00',
              title: 'Taller de salsa',
              description: 'Aprende los pasos basicos',
              location: 'Casa de la Musica',
              duration: '2 horas'
            }
          ]
        },
        {
          day: 3,
          title: 'Despedida',
          activities: [
            {
              time: '10:00',
              title: 'Visita a Fusterlandia',
              description: 'Arte contemporaneo cubano',
              location: 'Jaimanitas',
              duration: '2 horas'
            },
            {
              time: '16:00',
              title: 'Traslado al aeropuerto',
              description: 'Fin del tour',
              location: 'Hotel',
              duration: '45 min'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'Varadero Playa y Naturaleza',
      description: 'Disfruta de las mejores playas y actividades acuaticas.',
      duration: '4 dias',
      totalPrice: 220,
      rating: 4.6,
      reviewCount: 89,
      days: [
        {
          day: 1,
          title: 'Llegada y Relax',
          activities: [
            {
              time: '12:00',
              title: 'Check-in y almuerzo',
              description: 'Bienvenida con coctel tropical',
              location: 'Resort Costa Clara',
              duration: '3 horas'
            }
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'Trinidad y Vinales',
      description: 'Colonialismo y naturaleza en un solo viaje.',
      duration: '5 dias',
      totalPrice: 350,
      rating: 4.9,
      reviewCount: 156,
      days: []
    }
  ]);

  protected readonly chatMessages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'host',
      message: 'Hola! Bienvenido a Viajes Cuba. En que puedo ayudarte?',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      sender: 'user',
      message: 'Hola! Me gustaria informacion sobre disponibilidad en La Habana.',
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: '3',
      sender: 'host',
      message: 'Por supuesto! Tenemos disponibilidad en el Hotel Prado Boutique y en el Hostal Patio Colonial. Cual te interesa mas?',
      timestamp: new Date(Date.now() - 3400000)
    }
  ]);

  protected readonly reviews = signal<Review[]>([
    {
      id: '1',
      userName: 'Maria Garcia',
      rating: 5,
      comment: 'Increible experiencia! El tour por La Habana Vieja fue perfecto. Nuestro guia era muy conocedor y amigable.',
      date: new Date('2026-06-15'),
      verified: true
    },
    {
      id: '2',
      userName: 'John Smith',
      rating: 4,
      comment: 'Muy buena organizacion. Los hoteles seleccionados eran excelentes. Recomendaria agregar mas tiempo libre.',
      date: new Date('2026-06-10'),
      verified: true
    },
    {
      id: '3',
      userName: 'Pierre Dupont',
      rating: 5,
      comment: 'Fantastique! Cuba est magnifique. Le voyage a ete parfaitement organise.',
      date: new Date('2026-06-05'),
      verified: true
    }
  ]);

  protected readonly guideItems = signal([
    {
      id: '1',
      title: 'Mapa de La Habana',
      description: 'Mapa interactivo con puntos de interes',
      icon: 'map-outline'
    },
    {
      id: '2',
      title: 'Restaurantes Recomendados',
      description: 'Los mejores lugares para comer',
      icon: 'compass-outline'
    },
    {
      id: '3',
      title: 'Consejos de Seguridad',
      description: 'Informacion importante para tu viaje',
      icon: 'location-outline'
    },
    {
      id: '4',
      title: 'Transporte Publico',
      description: 'Como moverte por la ciudad',
      icon: 'time-outline'
    }
  ]);

  constructor() {
    addIcons({
      compassOutline,
      chatbubbleOutline,
      starOutline,
      mapOutline,
      timeOutline,
      locationOutline,
      createOutline
    });
  }

  updateTab(value: string | number | undefined): void {
    if (value && typeof value === 'string') {
      this.activeTab.set(value);
    }
  }

  selectItinerary(itinerary: Itinerary): void {
    this.selectedItinerary.set(itinerary);
  }

  sendMessage(): void {
    const message = this.newMessage().trim();
    if (!message) return;

    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date()
    };

    this.chatMessages.update(msgs => [...msgs, newChatMessage]);
    this.newMessage.set('');

    // Simulate host response
    setTimeout(() => {
      const hostResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'host',
        message: 'Gracias por tu mensaje. Te responderemos pronto con la informacion solicitada.',
        timestamp: new Date()
      };
      this.chatMessages.update(msgs => [...msgs, hostResponse]);
    }, 1500);
  }
}