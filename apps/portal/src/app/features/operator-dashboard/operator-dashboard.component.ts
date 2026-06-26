import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  bedOutline,
  calendarOutline,
      barChartOutline,
  cashOutline,
  trendingUpOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';
import { TravelListing, bookingMetrics } from '@viajes/domain';

interface MetricCard {
  label: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
}

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'booked' | 'maintenance';
  occupancy: number;
  nextBooking: string | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: number;
}

@Component({
  selector: 'viajes-operator-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
    IonCol,
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
          Panel de Gestion Operativa
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="refreshData()">
            Actualizar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().operatorDashboard.enabled) {
        <ion-segment [value]="activeTab()" (ionChange)="updateTab($event.detail.value)">
          <ion-segment-button value="metrics">
            <ion-label>Metricas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="inventory">
            <ion-label>Inventario</ion-label>
          </ion-segment-button>
          <ion-segment-button value="calendar">
            <ion-label>Calendario</ion-label>
          </ion-segment-button>
        </ion-segment>

        @switch (activeTab()) {
          @case ('metrics') {
            @if (featureFlags().operatorDashboard.realTimeMetrics) {
              <div class="metrics-dashboard">
                <ion-grid>
                  <ion-row>
                    @for (metric of metricsCards(); track metric.label) {
                      <ion-col size="12" size-md="6" size-lg="3">
                        <ion-card class="metric-card" [style.border-left-color]="metric.color">
                          <ion-card-content>
                            <div class="metric-icon">
                              <ion-icon [name]="metric.icon" [color]="metric.color"></ion-icon>
                            </div>
                            <div class="metric-info">
                              <span class="metric-label">{{ metric.label }}</span>
                              <span class="metric-value">{{ metric.value }}</span>
                              <span class="metric-trend" [class.positive]="metric.trend.includes('+')">
                                {{ metric.trend }}
                              </span>
                            </div>
                          </ion-card-content>
                        </ion-card>
                      </ion-col>
                    }
                  </ion-row>
                </ion-grid>

                <div class="charts-section">
                  <ion-card>
                    <ion-card-header>
                      <ion-card-title>Tendencia de Reservas (Ultimos 7 dias)</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      <div class="chart-placeholder">
                        @for (day of weeklyData(); track day.day) {
                          <div class="bar" [style.height.%]="day.percentage">
                            <span class="bar-value">{{ day.count }}</span>
                            <span class="bar-label">{{ day.day }}</span>
                          </div>
                        }
                      </div>
                    </ion-card-content>
                  </ion-card>

                  <ion-card>
                    <ion-card-header>
                      <ion-card-title>Top Destinos</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      <ion-list>
                        @for (dest of topDestinations(); track dest.name) {
                          <ion-item>
                            <ion-label>
                              <h3>{{ dest.name }}</h3>
                              <p>{{ dest.bookings }} reservas este mes</p>
                            </ion-label>
                            <ion-badge slot="end" [color]="dest.trend > 0 ? 'success' : 'warning'">
                              {{ dest.trend > 0 ? '+' : '' }}{{ dest.trend }}%
                            </ion-badge>
                          </ion-item>
                        }
                      </ion-list>
                    </ion-card-content>
                  </ion-card>
                </div>
              </div>
            }
          }

          @case ('inventory') {
            @if (featureFlags().operatorDashboard.inventoryManagement) {
              <div class="inventory-section">
                <div class="inventory-header">
                  <h2>Gestion de Inventario</h2>
                  <ion-button>
                    <ion-icon name="bed-outline" slot="start"></ion-icon>
                    Agregar Propiedad
                  </ion-button>
                </div>

                <ion-list>
                  @for (item of inventoryItems(); track item.id) {
                    <ion-card class="inventory-item">
                      <ion-card-content>
                        <div class="inventory-content">
                          <div class="item-info">
                            <h3>{{ item.name }}</h3>
                            <p>{{ item.type }}</p>
                          </div>
                          <div class="item-status">
                            <ion-chip [color]="getStatusColor(item.status)">
                              {{ getStatusLabel(item.status) }}
                            </ion-chip>
                          </div>
                          <div class="item-occupancy">
                            <span>Ocupacion</span>
                            <div class="occupancy-bar">
                              <div class="occupancy-fill" [style.width.%]="item.occupancy"></div>
                            </div>
                            <span>{{ item.occupancy }}%</span>
                          </div>
                          <div class="item-next-booking">
                            @if (item.nextBooking) {
                              <span>Proxima reserva: {{ item.nextBooking }}</span>
                            } @else {
                              <span>Sin reservas proximas</span>
                            }
                          </div>
                          <ion-button fill="clear">
                            Editar
                          </ion-button>
                        </div>
                      </ion-card-content>
                    </ion-card>
                  }
                </ion-list>
              </div>
            }
          }

          @case ('calendar') {
            @if (featureFlags().operatorDashboard.calendarView) {
              <div class="calendar-section">
                <div class="calendar-header">
                  <ion-button fill="clear" (click)="previousMonth()">
                    Anterior
                  </ion-button>
                  <h2>{{ currentMonthYear() }}</h2>
                  <ion-button fill="clear" (click)="nextMonth()">
                    Siguiente
                  </ion-button>
                </div>

                <div class="calendar-grid">
                  <div class="calendar-day-header">Lun</div>
                  <div class="calendar-day-header">Mar</div>
                  <div class="calendar-day-header">Mie</div>
                  <div class="calendar-day-header">Jue</div>
                  <div class="calendar-day-header">Vie</div>
                  <div class="calendar-day-header">Sab</div>
                  <div class="calendar-day-header">Dom</div>

                  @for (day of calendarDays(); track day.date.toISOString()) {
                    <div 
                      class="calendar-day" 
                      [class.other-month]="!day.isCurrentMonth"
                      [class.today]="day.isToday"
                      [class.has-bookings]="day.bookings > 0">
                      <span class="day-number">{{ day.date.getDate() }}</span>
                      @if (day.bookings > 0) {
                        <span class="booking-count">{{ day.bookings }}</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="analytics-outline"></ion-icon>
          <h3>Panel Operativo No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .metrics-dashboard {
      padding: 1rem 0;
    }
    
    .metric-card {
      border-left: 4px solid;
      margin-bottom: 1rem;
    }
    
    .metric-card ion-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .metric-icon {
      font-size: 2rem;
    }
    
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    
    .metric-label {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .metric-trend {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
    }
    
    .metric-trend.positive {
      color: var(--ion-color-success);
    }
    
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }
    
    .chart-placeholder {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 200px;
      padding: 1rem 0;
    }
    
    .bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40px;
      background: var(--ion-color-primary);
      border-radius: 4px 4px 0 0;
      position: relative;
    }
    
    .bar-value {
      position: absolute;
      top: -20px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    
    .bar-label {
      position: absolute;
      bottom: -20px;
      font-size: 0.7rem;
    }
    
    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .inventory-content {
      display: grid;
      grid-template-columns: 1fr auto auto auto auto;
      align-items: center;
      gap: 1rem;
    }
    
    .occupancy-bar {
      width: 100px;
      height: 8px;
      background: var(--ion-color-light);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .occupancy-fill {
      height: 100%;
      background: var(--ion-color-primary);
      transition: width 0.3s ease;
    }
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    
    .calendar-day-header {
      text-align: center;
      font-weight: bold;
      padding: 0.5rem;
      background: var(--ion-color-light);
    }
    
    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--ion-color-light);
      border-radius: 4px;
      cursor: pointer;
    }
    
    .calendar-day.other-month {
      opacity: 0.3;
    }
    
    .calendar-day.today {
      background: var(--ion-color-primary-tint);
    }
    
    .calendar-day.has-bookings {
      background: var(--ion-color-success-tint);
    }
    
    .booking-count {
      font-size: 0.7rem;
      background: var(--ion-color-primary);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
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
export class OperatorDashboardComponent implements OnInit {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly activeTab = signal<string>('metrics');
  protected readonly currentDate = signal(new Date());
  
  protected readonly metricsCards = computed<MetricCard[]>(() => [
    {
      label: 'Reservas este mes',
      value: '1,284',
      trend: '+18% mensual',
      icon: 'trending-up-outline',
      color: 'primary'
    },
    {
      label: 'Ocupacion media',
      value: '76%',
      trend: 'Temporada alta',
      icon: 'bed-outline',
      color: 'success'
    },
    {
      label: 'Ticket promedio',
      value: '86 USD',
      trend: '+11 USD',
      icon: 'cash-outline',
      color: 'tertiary'
    },
    {
      label: 'Ingresos totales',
      value: '110,424 USD',
      trend: '+22% mensual',
      icon: 'bar-chart-outline',
      color: 'warning'
    }
  ]);

  protected readonly weeklyData = signal([
    { day: 'Lun', count: 42, percentage: 70 },
    { day: 'Mar', count: 38, percentage: 63 },
    { day: 'Mie', count: 55, percentage: 92 },
    { day: 'Jue', count: 60, percentage: 100 },
    { day: 'Vie', count: 48, percentage: 80 },
    { day: 'Sab', count: 35, percentage: 58 },
    { day: 'Dom', count: 28, percentage: 47 }
  ]);

  protected readonly topDestinations = signal([
    { name: 'La Habana', bookings: 456, trend: 12 },
    { name: 'Varadero', bookings: 389, trend: 8 },
    { name: 'Trinidad', bookings: 234, trend: 15 },
    { name: 'Vinales', bookings: 198, trend: -3 }
  ]);

  protected readonly inventoryItems = signal<InventoryItem[]>([
    {
      id: '1',
      name: 'Hotel Prado Boutique',
      type: 'Hotel',
      status: 'available',
      occupancy: 85,
      nextBooking: '25 Jun 2026'
    },
    {
      id: '2',
      name: 'Hostal Patio Colonial',
      type: 'Hostal',
      status: 'booked',
      occupancy: 100,
      nextBooking: null
    },
    {
      id: '3',
      name: 'Villa Mogote Verde',
      type: 'Villa',
      status: 'available',
      occupancy: 60,
      nextBooking: '28 Jun 2026'
    },
    {
      id: '4',
      name: 'Costa Clara Resort',
      type: 'Hotel',
      status: 'maintenance',
      occupancy: 0,
      nextBooking: null
    }
  ]);

  protected readonly currentMonthYear = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  protected readonly calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Add days from previous month
    const startDay = firstDay.getDay() || 7;
    for (let i = startDay - 1; i > 0; i--) {
      const d = new Date(year, month, -i + 1);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        bookings: 0
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.toDateString() === today.toDateString(),
        bookings: Math.floor(Math.random() * 10)
      });
    }
    
    // Add days from next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        bookings: 0
      });
    }
    
    return days;
  });

  constructor() {
    addIcons({
      analyticsOutline,
      bedOutline,
      calendarOutline,
  barChartOutline,
      cashOutline,
      trendingUpOutline,
      alertCircleOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit(): void {}

  updateTab(value: string | number | undefined): void {
    if (value && typeof value === 'string') {
      this.activeTab.set(value);
    }
  }

  refreshData(): void {
    console.log('Refreshing dashboard data...');
  }

  previousMonth(): void {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }

  nextMonth(): void {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      available: 'success',
      booked: 'primary',
      maintenance: 'warning'
    };
    return colors[status] || 'medium';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Disponible',
      booked: 'Reservado',
      maintenance: 'Mantenimiento'
    };
    return labels[status] || status;
  }
}