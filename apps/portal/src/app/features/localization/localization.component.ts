import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
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
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  globeOutline,
  cashOutline,
  languageOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';
import { LocalizationService } from './localization.service';

@Component({
  selector: 'viajes-localization',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
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
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="globe-outline"></ion-icon>
          Configuracion Regional
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().multiLanguage.enabled || featureFlags().multiCurrency.enabled) {
        <div class="localization-grid">
          @if (featureFlags().multiLanguage.enabled) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="language-outline"></ion-icon>
                  Idioma
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  @for (lang of availableLanguages(); track lang) {
                    <ion-item 
                      button 
                      [class.selected]="currentLanguage() === lang"
                      (click)="setLanguage(lang)">
                      <ion-label>
                        <h3>{{ getLanguageName(lang) }}</h3>
                        <p>{{ getLanguageNative(lang) }}</p>
                      </ion-label>
                      @if (currentLanguage() === lang) {
                        <ion-icon name="checkmark-circle" color="primary" slot="end"></ion-icon>
                      }
                    </ion-item>
                  }
                </ion-list>
              </ion-card-content>
            </ion-card>
          }

          @if (featureFlags().multiCurrency.enabled) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="cash-outline"></ion-icon>
                  Moneda
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  @for (currency of availableCurrencies(); track currency) {
                    <ion-item 
                      button 
                      [class.selected]="currentCurrency() === currency"
                      (click)="setCurrency(currency)">
                      <ion-label>
                        <h3>{{ getCurrencyName(currency) }}</h3>
                        <p>{{ getCurrencySymbol(currency) }} - {{ getCurrencyCode(currency) }}</p>
                      </ion-label>
                      @if (currentCurrency() === currency) {
                        <ion-icon name="checkmark-circle" color="primary" slot="end"></ion-icon>
                      }
                    </ion-item>
                  }
                </ion-list>
              </ion-card-content>
            </ion-card>
          }
        </div>

        <div class="preview-section">
          <h3>Vista Previa</h3>
          <div class="preview-content">
            <div class="preview-item">
              <span class="label">{{ localization.translate('price') }}:</span>
              <span class="value">{{ localization.formatPrice(92) }}</span>
            </div>
            <div class="preview-item">
              <span class="label">{{ localization.translate('perNight') }}</span>
            </div>
            <div class="preview-item">
              <span class="label">{{ localization.translate('bookNow') }}</span>
              <ion-button size="small">{{ localization.translate('confirm') }}</ion-button>
            </div>
          </div>
        </div>
      } @else {
        <div class="feature-disabled">
          <ion-icon name="globe-outline"></ion-icon>
          <h3>Configuracion Regional No Disponible</h3>
          <p>Las funcionalidades de multi-idioma y multi-moneda no estan habilitadas.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .localization-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    ion-card {
      margin-bottom: 1rem;
    }
    
    ion-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    ion-item.selected {
      --background: var(--ion-color-primary-tint);
    }
    
    .preview-section {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    
    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .preview-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .preview-item .label {
      font-weight: bold;
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
export class LocalizationComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  protected readonly localization = inject(LocalizationService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly currentLanguage = this.localization.currentLanguage;
  protected readonly currentCurrency = this.localization.currentCurrency;
  protected readonly availableLanguages = this.localization.availableLanguages;
  protected readonly availableCurrencies = this.localization.availableCurrencies;

  constructor() {
    addIcons({ globeOutline, cashOutline, languageOutline });
    this.localization.initializeFromStorage();
  }

  setLanguage(lang: string): void {
    this.localization.setLanguage(lang);
  }

  setCurrency(currency: string): void {
    this.localization.setCurrency(currency);
  }

  getLanguageName(code: string): string {
    const names: Record<string, string> = {
      es: 'Espanol',
      en: 'English',
      fr: 'Francais'
    };
    return names[code] || code;
  }

  getLanguageNative(code: string): string {
    const native: Record<string, string> = {
      es: 'Espanol',
      en: 'English',
      fr: 'Francais'
    };
    return native[code] || code;
  }

  getCurrencyName(code: string): string {
    const names: Record<string, string> = {
      USD: 'Dolar Americano',
      CUP: 'Peso Cubano',
      EUR: 'Euro'
    };
    return names[code] || code;
  }

  getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      CUP: '₱',
      EUR: '€'
    };
    return symbols[code] || code;
  }

  getCurrencyCode(code: string): string {
    return code;
  }
}