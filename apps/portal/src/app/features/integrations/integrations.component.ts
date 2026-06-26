import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mapOutline,
  logoWhatsapp,
  analyticsOutline,
  notificationsOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  settingsOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  connected: boolean;
  lastSync?: Date;
  error?: string;
}

interface MapLocation {
  lat: number;
  lng: number;
  title: string;
  description: string;
}

@Component({
  selector: 'viajes-integrations',
  standalone: true,
  imports: [
    CommonModule,
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
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="settings-outline"></ion-icon>
          Integraciones Externas
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (hasAnyIntegrationEnabled()) {
        <div class="integrations-grid">
          @if (featureFlags().integrations.googleMaps) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="map-outline"></ion-icon>
                  Google Maps
                </ion-card-title>
                <ion-chip [color]="integrations().googleMaps.connected ? 'success' : 'warning'">
                  {{ integrations().googleMaps.connected ? 'Conectado' : 'Desconectado' }}
                </ion-chip>
              </ion-card-header>
              <ion-card-content>
                <p>Mapas interactivos, rutas y ubicaciones de propiedades.</p>
                
                <div class="integration-features">
                  <ion-item>
                    <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
                    <ion-label>Mapa de propiedades</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
                    <ion-label>Navegacion GPS</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
                    <ion-label>Puntos de interes</ion-label>
                  </ion-item>
                </div>

                @if (integrations().googleMaps.lastSync) {
                  <p class="sync-info">Ultima sincronizacion: {{ integrations().googleMaps.lastSync | date:'medium' }}</p>
                }

                <div class="map-preview">
                  <div class="map-placeholder">
                    <ion-icon name="map-outline"></ion-icon>
                    <span>Vista previa del mapa</span>
                    <div class="map-markers">
                      @for (location of sampleLocations(); track location.title) {
                        <div class="marker" [style.left.%]="location.lng % 100" [style.top.%]="location.lat % 100">
                          <ion-icon name="location"></ion-icon>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          }

          @if (featureFlags().integrations.whatsappBusiness) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="logo-whatsapp"></ion-icon>
                  WhatsApp Business
                </ion-card-title>
                <ion-chip [color]="integrations().whatsapp.connected ? 'success' : 'warning'">
                  {{ integrations().whatsapp.connected ? 'Conectado' : 'Desconectado' }}
                </ion-chip>
              </ion-card-header>
              <ion-card-content>
                <p>Confirmaciones automaticas y soporte via WhatsApp.</p>
                
                <div class="integration-features">
                  <ion-item>
                    <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
                    <ion-label>Confirmaciones de reserva</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
                    <ion-label>Recordatorios de check-in</ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
                    <ion-label>Soporte al cliente</ion-label>
                  </ion-item>
                </div>

                <div class="whatsapp-preview">
                  <div class="phone-mockup">
                    <div class="message-incoming">
                      <p><strong>Viajes Cuba</strong></p>
                      <p>Tu reserva en Hotel Prado Boutique ha sido confirmada!</p>
                      <p>Check-in: 25 Jun 2026</p>
                      <span class="time">10:30</span>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          }

          @if (featureFlags().integrations.googleAnalytics) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="analytics-outline"></ion-icon>
                  Google Analytics
                </ion-card-title>
                <ion-chip [color]="integrations().analytics.connected ? 'success' : 'warning'">
                  {{ integrations().analytics.connected ? 'Conectado' : 'Desconectado' }}
                </ion-chip>
              </ion-card-header>
              <ion-card-content>
                <p>Seguimiento de conversiones y comportamiento de usuarios.</p>
                
                <div class="analytics-stats">
                  <div class="stat">
                    <span class="stat-value">{{ analyticsData().visitors }}</span>
                    <span class="stat-label">Visitantes hoy</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ analyticsData().conversions }}</span>
                    <span class="stat-label">Conversiones</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ analyticsData().bounceRate }}%</span>
                    <span class="stat-label">Rebote</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          }

          @if (featureFlags().integrations.pushNotifications) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="notifications-outline"></ion-icon>
                  Push Notifications
                </ion-card-title>
                <ion-chip [color]="integrations().pushNotifications.connected ? 'success' : 'warning'">
                  {{ integrations().pushNotifications.connected ? 'Activo' : 'Inactivo' }}
                </ion-chip>
              </ion-card-header>
              <ion-card-content>
                <p>Notificaciones push para ofertas y recordatorios.</p>
                
                <div class="notification-templates">
                  <h4>Plantillas de Notificacion</h4>
                  <ion-list>
                    <ion-item>
                      <ion-label>
                        <h3>Oferta especial</h3>
                        <p>Descuento del 20% en tu proximo destino</p>
                      </ion-label>
                      <ion-button fill="outline" slot="end">Editar</ion-button>
                    </ion-item>
                    <ion-item>
                      <ion-label>
                        <h3>Recordatorio de reserva</h3>
                        <p>Tu check-in es manana!</p>
                      </ion-label>
                      <ion-button fill="outline" slot="end">Editar</ion-button>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      } @else {
        <div class="feature-disabled">
          <ion-icon name="settings-outline"></ion-icon>
          <h3>Integraciones No Disponibles</h3>
          <p>Ninguna integracion externa esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .integrations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1rem;
    }
    
    ion-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    ion-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .integration-features {
      margin: 1rem 0;
    }
    
    .sync-info {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .map-preview {
      margin-top: 1rem;
    }
    
    .map-placeholder {
      position: relative;
      height: 200px;
      background: var(--ion-color-light);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .map-placeholder ion-icon {
      font-size: 3rem;
      color: var(--ion-color-medium);
      margin-bottom: 0.5rem;
    }
    
    .map-markers {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    
    .marker {
      position: absolute;
      color: var(--ion-color-danger);
      transform: translate(-50%, -100%);
    }
    
    .whatsapp-preview {
      margin-top: 1rem;
    }
    
    .phone-mockup {
      max-width: 250px;
      margin: 0 auto;
      background: #ECE5DD;
      border-radius: 12px;
      padding: 1rem;
    }
    
    .message-incoming {
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    
    .message-incoming p {
      margin: 0.25rem 0;
    }
    
    .message-incoming .time {
      display: block;
      text-align: right;
      font-size: 0.7rem;
      color: var(--ion-color-medium);
    }
    
    .analytics-stats {
      display: flex;
      justify-content: space-around;
      margin: 1rem 0;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .notification-templates h4 {
      margin: 1rem 0 0.5rem;
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
export class IntegrationsComponent implements OnInit, OnDestroy {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;

  protected readonly integrations = signal({
    googleMaps: {
      connected: true,
      lastSync: new Date(Date.now() - 3600000)
    },
    whatsapp: {
      connected: false,
      lastSync: null
    },
    analytics: {
      connected: true,
      lastSync: new Date()
    },
    pushNotifications: {
      connected: true,
      lastSync: null
    }
  });

  protected readonly analyticsData = signal({
    visitors: 1247,
    conversions: 89,
    bounceRate: 32
  });

  protected readonly sampleLocations = signal<MapLocation[]>([
    { lat: 23.1136, lng: -82.3666, title: 'Hotel Prado Boutique', description: 'La Habana' },
    { lat: 21.7958, lng: -80.4394, title: 'Costa Clara Resort', description: 'Varadero' },
    { lat: 21.8044, lng: -79.9847, title: 'Hostal Patio Colonial', description: 'Trinidad' }
  ]);

  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    addIcons({
      mapOutline,
      logoWhatsapp,
      analyticsOutline,
      notificationsOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      settingsOutline
    });
  }

  ngOnInit(): void {
    // Simulate real-time updates
    this.syncInterval = setInterval(() => {
      this.analyticsData.update(data => ({
        ...data,
        visitors: data.visitors + Math.floor(Math.random() * 5),
        conversions: data.conversions + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  hasAnyIntegrationEnabled(): boolean {
    const features = this.featureFlags().integrations;
    return features.googleMaps || 
           features.whatsappBusiness || 
           features.googleAnalytics || 
           features.pushNotifications;
  }
}
