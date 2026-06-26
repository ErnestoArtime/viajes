import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  saveOutline,
  refreshOutline
} from 'ionicons/icons';
import { FeatureFlags, FeatureFlagsService } from '@viajes/tenant-config';

type FeatureCategory = keyof FeatureFlags;

@Component({
  selector: 'viajes-admin-features',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToggle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="settings-outline"></ion-icon>
          Administracion de Funcionalidades
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="saveChanges()" [disabled]="!hasChanges()">
            <ion-icon name="save-outline" slot="start"></ion-icon>
            Guardar
          </ion-button>
          <ion-button (click)="resetChanges()">
            <ion-icon name="refresh-outline" slot="start"></ion-icon>
            Restablecer
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-segment [value]="selectedCategory()" (ionChange)="updateCategory($event.detail.value)">
        <ion-segment-button value="booking">
          <ion-label>Reservas</ion-label>
        </ion-segment-button>
        <ion-segment-button value="operatorDashboard">
          <ion-label>Panel Operativo</ion-label>
        </ion-segment-button>
        <ion-segment-button value="travelerExperience">
          <ion-label>Experiencia</ion-label>
        </ion-segment-button>
        <ion-segment-button value="multiLanguage">
          <ion-label>Idiomas</ion-label>
        </ion-segment-button>
        <ion-segment-button value="multiCurrency">
          <ion-label>Monedas</ion-label>
        </ion-segment-button>
        <ion-segment-button value="loyalty">
          <ion-label>Fidelizacion</ion-label>
        </ion-segment-button>
        <ion-segment-button value="integrations">
          <ion-label>Integraciones</ion-label>
        </ion-segment-button>
        <ion-segment-button value="auth">
          <ion-label>Autenticacion</ion-label>
        </ion-segment-button>
        <ion-segment-button value="transport">
          <ion-label>Transporte</ion-label>
        </ion-segment-button>
        <ion-segment-button value="content">
          <ion-label>Contenido</ion-label>
        </ion-segment-button>
        <ion-segment-button value="analytics">
          <ion-label>Analytics</ion-label>
        </ion-segment-button>
      </ion-segment>

      <div class="feature-panel">
        @switch (selectedCategory()) {
          @case ('booking') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Sistema de Reservas y Pagos</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar modulo de reservas</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().booking.enabled"
                      (ionChange)="toggleFeature('booking.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Pasarela de pago</ion-label>
                    <select 
                      [value]="localFlags().booking.paymentGateway"
                      (change)="updateFeature('booking.paymentGateway', $any($event.target).value)">
                      <option value="none">Deshabilitada</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                      <option value="transfer">Transferencia</option>
                      <option value="crypto">Criptomonedas</option>
                    </select>
                  </ion-item>
                  <ion-item>
                    <ion-label>Confirmacion automatica</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().booking.autoConfirm"
                      (ionChange)="toggleFeature('booking.autoConfirm', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Politica de cancelacion</ion-label>
                    <select 
                      [value]="localFlags().booking.cancellationPolicy"
                      (change)="updateFeature('booking.cancellationPolicy', $any($event.target).value)">
                      <option value="flexible">Flexible</option>
                      <option value="moderate">Moderada</option>
                      <option value="strict">Estricta</option>
                    </select>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('operatorDashboard') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Panel de Gestion para Operadores</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar panel operativo</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().operatorDashboard.enabled"
                      (ionChange)="toggleFeature('operatorDashboard.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Metricas en tiempo real</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().operatorDashboard.realTimeMetrics"
                      (ionChange)="toggleFeature('operatorDashboard.realTimeMetrics', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Gestion de inventario</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().operatorDashboard.inventoryManagement"
                      (ionChange)="toggleFeature('operatorDashboard.inventoryManagement', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Vista de calendario</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().operatorDashboard.calendarView"
                      (ionChange)="toggleFeature('operatorDashboard.calendarView', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('travelerExperience') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Experiencias del Viajero</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar experiencias</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().travelerExperience.enabled"
                      (ionChange)="toggleFeature('travelerExperience.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Itinerarios personalizados</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().travelerExperience.itineraries"
                      (ionChange)="toggleFeature('travelerExperience.itineraries', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Guia offline</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().travelerExperience.offlineGuide"
                      (ionChange)="toggleFeature('travelerExperience.offlineGuide', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Chat con anfitriones</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().travelerExperience.chatWithHosts"
                      (ionChange)="toggleFeature('travelerExperience.chatWithHosts', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Resenas verificadas</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().travelerExperience.verifiedReviews"
                      (ionChange)="toggleFeature('travelerExperience.verifiedReviews', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('multiLanguage') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Multi-idioma</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar multi-idioma</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().multiLanguage.enabled"
                      (ionChange)="toggleFeature('multiLanguage.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Idiomas disponibles</ion-label>
                    <div class="checkbox-group">
                      <label>
                        <input type="checkbox" 
                          [checked]="localFlags().multiLanguage.languages.includes('es')"
                          (change)="toggleLanguage('es', $any($event.target).checked)">
                        Espanol
                      </label>
                      <label>
                        <input type="checkbox" 
                          [checked]="localFlags().multiLanguage.languages.includes('en')"
                          (change)="toggleLanguage('en', $any($event.target).checked)">
                        Ingles
                      </label>
                      <label>
                        <input type="checkbox" 
                          [checked]="localFlags().multiLanguage.languages.includes('fr')"
                          (change)="toggleLanguage('fr', $any($event.target).checked)">
                        Frances
                      </label>
                    </div>
                  </ion-item>
                  <ion-item>
                    <ion-label>Idioma por defecto</ion-label>
                    <select 
                      [value]="localFlags().multiLanguage.defaultLanguage"
                      (change)="updateFeature('multiLanguage.defaultLanguage', $any($event.target).value)">
                      <option value="es">Espanol</option>
                      <option value="en">Ingles</option>
                      <option value="fr">Frances</option>
                    </select>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('multiCurrency') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Multi-moneda</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar multi-moneda</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().multiCurrency.enabled"
                      (ionChange)="toggleFeature('multiCurrency.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Monedas disponibles</ion-label>
                    <div class="checkbox-group">
                      <label>
                        <input type="checkbox" 
                          [checked]="localFlags().multiCurrency.currencies.includes('USD')"
                          (change)="toggleCurrency('USD', $any($event.target).checked)">
                        USD
                      </label>
                      <label>
                        <input type="checkbox" 
                          [checked]="localFlags().multiCurrency.currencies.includes('CUP')"
                          (change)="toggleCurrency('CUP', $any($event.target).checked)">
                        CUP
                      </label>
                      <label>
                        <input type="checkbox" 
                          [checked]="localFlags().multiCurrency.currencies.includes('EUR')"
                          (change)="toggleCurrency('EUR', $any($event.target).checked)">
                        EUR
                      </label>
                    </div>
                  </ion-item>
                  <ion-item>
                    <ion-label>Moneda por defecto</ion-label>
                    <select 
                      [value]="localFlags().multiCurrency.defaultCurrency"
                      (change)="updateFeature('multiCurrency.defaultCurrency', $any($event.target).value)">
                      <option value="USD">USD</option>
                      <option value="CUP">CUP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </ion-item>
                  <ion-item>
                    <ion-label>Precios dinamicos</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().multiCurrency.dynamicPricing"
                      (ionChange)="toggleFeature('multiCurrency.dynamicPricing', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('loyalty') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Sistema de Fidelizacion</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar fidelizacion</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().loyalty.enabled"
                      (ionChange)="toggleFeature('loyalty.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Puntos por dolar</ion-label>
                    <input type="number" 
                      [value]="localFlags().loyalty.pointsPerDollar"
                      (change)="updateFeature('loyalty.pointsPerDollar', +$any($event.target).value)"
                      min="0" max="100">
                  </ion-item>
                  <ion-item>
                    <ion-label>Descuento por referido (%)</ion-label>
                    <input type="number" 
                      [value]="localFlags().loyalty.referralDiscount"
                      (change)="updateFeature('loyalty.referralDiscount', +$any($event.target).value)"
                      min="0" max="50">
                  </ion-item>
                  <ion-item>
                    <ion-label>Badges de viajero</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().loyalty.travelerBadges"
                      (ionChange)="toggleFeature('loyalty.travelerBadges', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('integrations') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Integraciones Externas</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Google Maps</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().integrations.googleMaps"
                      (ionChange)="toggleFeature('integrations.googleMaps', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>WhatsApp Business</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().integrations.whatsappBusiness"
                      (ionChange)="toggleFeature('integrations.whatsappBusiness', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Google Analytics</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().integrations.googleAnalytics"
                      (ionChange)="toggleFeature('integrations.googleAnalytics', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Push Notifications</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().integrations.pushNotifications"
                      (ionChange)="toggleFeature('integrations.pushNotifications', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('auth') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Autenticacion y Seguridad</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar autenticacion</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().auth.enabled"
                      (ionChange)="toggleFeature('auth.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Email y contrasena</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().auth.emailPassword"
                      (ionChange)="toggleFeature('auth.emailPassword', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Verificacion OTP</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().auth.otpVerification"
                      (ionChange)="toggleFeature('auth.otpVerification', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Verificacion de anfitriones</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().auth.hostVerification"
                      (ionChange)="toggleFeature('auth.hostVerification', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('transport') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Modulo de Transporte</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar transporte</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().transport.enabled"
                      (ionChange)="toggleFeature('transport.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Taxi privado</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().transport.privateTaxi"
                      (ionChange)="toggleFeature('transport.privateTaxi', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Transporte compartido</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().transport.sharedTransport"
                      (ionChange)="toggleFeature('transport.sharedTransport', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Alquiler de autos</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().transport.carRental"
                      (ionChange)="toggleFeature('transport.carRental', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Traslados aeropuerto</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().transport.airportTransfer"
                      (ionChange)="toggleFeature('transport.airportTransfer', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('content') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Contenido y Marketing</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar contenido</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().content.enabled"
                      (ionChange)="toggleFeature('content.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Blog de destinos</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().content.blog"
                      (ionChange)="toggleFeature('content.blog', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Virtuales tours 360°</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().content.virtualTours"
                      (ionChange)="toggleFeature('content.virtualTours', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Testimonios de viajeros</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().content.travelerTestimonials"
                      (ionChange)="toggleFeature('content.travelerTestimonials', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
          @case ('analytics') {
            <ion-card>
              <ion-card-header>
                <ion-card-title>Analytics Inteligente</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Habilitar analytics</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().analytics.enabled"
                      (ionChange)="toggleFeature('analytics.enabled', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Prediccion de demanda</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().analytics.demandPrediction"
                      (ionChange)="toggleFeature('analytics.demandPrediction', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Optimizacion de precios</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().analytics.priceOptimization"
                      (ionChange)="toggleFeature('analytics.priceOptimization', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>Alertas de bajo inventario</ion-label>
                    <ion-toggle 
                      [checked]="localFlags().analytics.lowInventoryAlerts"
                      (ionChange)="toggleFeature('analytics.lowInventoryAlerts', $event.detail.checked)">
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .feature-panel {
      margin-top: 1rem;
    }
    
    ion-card {
      margin-bottom: 1rem;
    }
    
    ion-item {
      --min-height: 48px;
    }
    
    select, input[type="number"] {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
    }
    
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }
    
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    
    .checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
    }
  `]
})
export class AdminFeaturesComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly selectedCategory = signal<FeatureCategory>('booking');
  protected readonly localFlags = signal<FeatureFlags>(structuredClone(this.featureFlagsService.flags()));
  
  protected readonly hasChanges = () => {
    const current = this.featureFlagsService.flags();
    const local = this.localFlags();
    return JSON.stringify(current) !== JSON.stringify(local);
  };

  constructor() {
    addIcons({ settingsOutline, saveOutline, refreshOutline });
  }

  protected updateCategory(value: string | number | undefined): void {
    if (value && typeof value === 'string') {
      this.selectedCategory.set(value as FeatureCategory);
    }
  }

  protected toggleFeature(path: string, value: boolean): void {
    this.updateNestedFeature(path, value);
  }

  protected updateFeature(path: string, value: unknown): void {
    this.updateNestedFeature(path, value);
  }

  protected toggleLanguage(lang: string, checked: boolean): void {
    const current = this.localFlags().multiLanguage.languages;
    const updated = checked ? [...current, lang] : current.filter(l => l !== lang);
    this.updateNestedFeature('multiLanguage.languages', updated);
  }

  protected toggleCurrency(currency: string, checked: boolean): void {
    const current = this.localFlags().multiCurrency.currencies;
    const updated = checked ? [...current, currency] : current.filter(c => c !== currency);
    this.updateNestedFeature('multiCurrency.currencies', updated);
  }

  protected saveChanges(): void {
    this.featureFlagsService.updateFlags(this.localFlags());
  }

  protected resetChanges(): void {
    this.localFlags.set(structuredClone(this.featureFlagsService.flags()));
  }

  private updateNestedFeature(path: string, value: unknown): void {
    this.localFlags.update(flags => {
      const newFlags = structuredClone(flags);
      const parts = path.split('.');
      let current: Record<string, unknown> = newFlags as unknown as Record<string, unknown>;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]] as Record<string, unknown>;
      }
      
      current[parts[parts.length - 1]] = value;
      return newFlags;
    });
  }
}