import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonBadge,
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
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  trendingUpOutline,
  trendingDownOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  barChartOutline,
  pulseOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';

interface DemandPrediction {
  destination: string;
  currentDemand: number;
  predictedDemand: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  period: string;
}

interface PriceRecommendation {
  listingId: string;
  listingName: string;
  currentPrice: number;
  recommendedPrice: number;
  reason: string;
  potentialImpact: number;
}

interface LowInventoryAlert {
  listingId: string;
  listingName: string;
  availableUnits: number;
  totalUnits: number;
  occupancyRate: number;
  alertLevel: 'warning' | 'critical';
}

interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

@Component({
  selector: 'viajes-analytics',
  standalone: true,
  imports: [
    CommonModule,
    IonBadge,
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
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="analytics-outline"></ion-icon>
          Analytics Inteligente
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().analytics.enabled) {
        <ion-segment [value]="activeTab()" (ionChange)="updateTab($event.detail.value)">
          @if (featureFlags().analytics.demandPrediction) {
            <ion-segment-button value="demand">
              <ion-label>Prediccion de Demanda</ion-label>
            </ion-segment-button>
          }
          @if (featureFlags().analytics.priceOptimization) {
            <ion-segment-button value="pricing">
              <ion-label>Optimizacion de Precios</ion-label>
            </ion-segment-button>
          }
          @if (featureFlags().analytics.lowInventoryAlerts) {
            <ion-segment-button value="inventory">
              <ion-label>Alertas de Inventario</ion-label>
            </ion-segment-button>
          }
        </ion-segment>

        <div class="metrics-overview">
          @for (metric of overviewMetrics(); track metric.label) {
            <ion-card class="metric-card">
              <ion-card-content>
                <div class="metric-icon">
                  <ion-icon [name]="metric.icon" [color]="metric.change > 0 ? 'success' : 'danger'"></ion-icon>
                </div>
                <div class="metric-info">
                  <span class="metric-value">{{ metric.value }}</span>
                  <span class="metric-label">{{ metric.label }}</span>
                  <span class="metric-change" [class.positive]="metric.change > 0">
                    @if (metric.change > 0) {
                      <ion-icon name="trending-up-outline"></ion-icon>
                    } @else {
                      <ion-icon name="trending-down-outline"></ion-icon>
                    }
                    {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
                  </span>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>

        @switch (activeTab()) {
          @case ('demand') {
            @if (featureFlags().analytics.demandPrediction) {
              <div class="demand-section">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Prediccion de Demanda - Proximos 30 Dias</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      @for (prediction of demandPredictions(); track prediction.destination) {
                        <ion-item>
                          <ion-label>
                            <h3>{{ prediction.destination }}</h3>
                            <p>Demanda actual: {{ prediction.currentDemand }}% | Predecida: {{ prediction.predictedDemand }}%</p>
                          </ion-label>
                          <div slot="end" class="prediction-info">
                            <ion-chip [color]="prediction.trend === 'up' ? 'success' : prediction.trend === 'down' ? 'danger' : 'warning'">
                              @if (prediction.trend === 'up') {
                                <ion-icon name="trending-up-outline"></ion-icon>
                              } @else if (prediction.trend === 'down') {
                                <ion-icon name="trending-down-outline"></ion-icon>
                              }
                              {{ prediction.trend === 'up' ? 'Subida' : prediction.trend === 'down' ? 'Bajada' : 'Estable' }}
                            </ion-chip>
                            <span class="confidence">Confianza: {{ prediction.confidence }}%</span>
                          </div>
                        </ion-item>
                      }
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </div>
            }
          }

          @case ('pricing') {
            @if (featureFlags().analytics.priceOptimization) {
              <div class="pricing-section">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Recomendaciones de Precio</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      @for (recommendation of priceRecommendations(); track recommendation.listingId) {
                        <ion-card class="recommendation-card">
                          <ion-card-content>
                            <div class="recommendation-header">
                              <h3>{{ recommendation.listingName }}</h3>
                              <ion-chip [color]="recommendation.potentialImpact > 0 ? 'success' : 'warning'">
                                {{ recommendation.potentialImpact > 0 ? '+' : '' }}{{ recommendation.potentialImpact }}% impacto
                              </ion-chip>
                            </div>
                            <div class="price-comparison">
                              <div class="current-price">
                                <span class="label">Precio actual</span>
                                <span class="value">{{ recommendation.currentPrice }} USD</span>
                              </div>
                              <div class="arrow">
                                <ion-icon name="trending-up-outline"></ion-icon>
                              </div>
                              <div class="recommended-price">
                                <span class="label">Precio recomendado</span>
                                <span class="value">{{ recommendation.recommendedPrice }} USD</span>
                              </div>
                            </div>
                            <p class="reason">{{ recommendation.reason }}</p>
                            <ion-button fill="outline" size="small">
                              Aplicar Recomendacion
                            </ion-button>
                          </ion-card-content>
                        </ion-card>
                      }
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </div>
            }
          }

          @case ('inventory') {
            @if (featureFlags().analytics.lowInventoryAlerts) {
              <div class="inventory-section">
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>Alertas de Bajo Inventario</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      @for (alert of lowInventoryAlerts(); track alert.listingId) {
                        <ion-item [class]="alert.alertLevel">
                          <ion-icon 
                            name="alert-circle-outline" 
                            [color]="alert.alertLevel === 'critical' ? 'danger' : 'warning'"
                            slot="start">
                          </ion-icon>
                          <ion-label>
                            <h3>{{ alert.listingName }}</h3>
                            <p>{{ alert.availableUnits }} de {{ alert.totalUnits }} unidades disponibles</p>
                          </ion-label>
                          <div slot="end" class="alert-info">
                            <ion-badge [color]="alert.alertLevel === 'critical' ? 'danger' : 'warning'">
                              {{ alert.alertLevel === 'critical' ? 'Critico' : 'Advertencia' }}
                            </ion-badge>
                            <span class="occupancy">{{ alert.occupancyRate }}% ocupado</span>
                          </div>
                        </ion-item>
                      }
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </div>
            }
          }
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="analytics-outline"></ion-icon>
          <h3>Analytics No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .metrics-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .metric-card ion-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .metric-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--ion-color-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .metric-icon ion-icon {
      font-size: 1.5rem;
    }
    
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .metric-label {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .metric-change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
    }
    
    .metric-change.positive {
      color: var(--ion-color-success);
    }
    
    .prediction-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    
    .confidence {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
    }
    
    .recommendation-card {
      margin-bottom: 1rem;
    }
    
    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .price-comparison {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin: 1.5rem 0;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    
    .price-comparison .label {
      display: block;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .price-comparison .value {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .arrow ion-icon {
      font-size: 1.5rem;
      color: var(--ion-color-success);
    }
    
    .reason {
      font-style: italic;
      color: var(--ion-color-medium);
      margin: 1rem 0;
    }
    
    .alert-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    
    .occupancy {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
    }
    
    ion-item.warning {
      --background: var(--ion-color-warning-tint);
    }
    
    ion-item.critical {
      --background: var(--ion-color-danger-tint);
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
export class AnalyticsComponent implements OnInit, OnDestroy {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly activeTab = signal<string>('demand');

  protected readonly overviewMetrics = signal<AnalyticsMetric[]>([
    { label: 'Reservas hoy', value: '47', change: 12, icon: 'trending-up-outline' },
    { label: 'Ingresos mes', value: '$28,450', change: 8, icon: 'bar-chart-outline' },
    { label: 'Ocupacion promedio', value: '78%', change: -3, icon: 'pulse-outline' },
    { label: 'Satisfaccion', value: '4.7/5', change: 5, icon: 'checkmark-circle-outline' }
  ]);

  protected readonly demandPredictions = signal<DemandPrediction[]>([
    {
      destination: 'La Habana',
      currentDemand: 85,
      predictedDemand: 92,
      trend: 'up',
      confidence: 87,
      period: 'Proximos 30 dias'
    },
    {
      destination: 'Varadero',
      currentDemand: 78,
      predictedDemand: 85,
      trend: 'up',
      confidence: 82,
      period: 'Proximos 30 dias'
    },
    {
      destination: 'Trinidad',
      currentDemand: 65,
      predictedDemand: 62,
      trend: 'down',
      confidence: 75,
      period: 'Proximos 30 dias'
    },
    {
      destination: 'Vinales',
      currentDemand: 70,
      predictedDemand: 71,
      trend: 'stable',
      confidence: 80,
      period: 'Proximos 30 dias'
    }
  ]);

  protected readonly priceRecommendations = signal<PriceRecommendation[]>([
    {
      listingId: '1',
      listingName: 'Hotel Prado Boutique',
      currentPrice: 92,
      recommendedPrice: 105,
      reason: 'Alta demanda esperada en temporada alta. Incremento del 14% justificado.',
      potentialImpact: 14
    },
    {
      listingId: '2',
      listingName: 'Hostal Patio Colonial',
      currentPrice: 38,
      recommendedPrice: 42,
      reason: 'Competitividad con hostales similares. Margen optimizable.',
      potentialImpact: 11
    },
    {
      listingId: '3',
      listingName: 'Villa Mogote Verde',
      currentPrice: 64,
      recommendedPrice: 58,
      reason: 'Baja demanda estacional. Reduccion para estimular reservas.',
      potentialImpact: -9
    }
  ]);

  protected readonly lowInventoryAlerts = signal<LowInventoryAlert[]>([
    {
      listingId: '1',
      listingName: 'Hotel Prado Boutique',
      availableUnits: 2,
      totalUnits: 20,
      occupancyRate: 90,
      alertLevel: 'critical'
    },
    {
      listingId: '2',
      listingName: 'Hostal Patio Colonial',
      availableUnits: 1,
      totalUnits: 8,
      occupancyRate: 87,
      alertLevel: 'critical'
    },
    {
      listingId: '4',
      listingName: 'Costa Clara Resort',
      availableUnits: 5,
      totalUnits: 50,
      occupancyRate: 90,
      alertLevel: 'warning'
    }
  ]);

  private updateInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    addIcons({
      analyticsOutline,
      trendingUpOutline,
      trendingDownOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      barChartOutline,
      pulseOutline
    });
  }

  ngOnInit(): void {
    // Simulate real-time updates
    this.updateInterval = setInterval(() => {
      this.overviewMetrics.update(metrics =>
        metrics.map(metric => ({
          ...metric,
          change: metric.change + (Math.random() > 0.5 ? 1 : -1)
        }))
      );
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  updateTab(value: string | number | undefined): void {
    if (typeof value === 'string') {
      this.activeTab.set(value);
    }
  }
}