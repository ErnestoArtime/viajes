import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, analyticsOutline, arrowForwardOutline, bedOutline, calendarOutline, cashOutline, checkmarkCircleOutline, cubeOutline, refreshOutline, trendingUpOutline } from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';

interface MetricCard {
  label: string;
  value: string;
  trend: string;
  icon: string;
  tone: 'ocean' | 'forest' | 'sun' | 'coral';
}

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'booked' | 'maintenance';
  occupancy: number;
  nextBooking: string | null;
}

@Component({
  selector: 'viajes-operator-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon],
  templateUrl: './operator-dashboard.component.html',
  styleUrl: './operator-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorDashboardComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);

  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly activeTab = signal<'metrics' | 'inventory' | 'calendar'>('metrics');
  protected readonly refreshedAt = signal('Actualizado ahora');
  protected readonly currentDate = signal(new Date());

  protected readonly metricsCards = signal<MetricCard[]>([
    { label: 'Reservas este mes', value: '1,284', trend: '+18% mensual', icon: 'trending-up-outline', tone: 'ocean' },
    { label: 'Ocupacion media', value: '76%', trend: 'Temporada alta', icon: 'bed-outline', tone: 'forest' },
    { label: 'Ticket promedio', value: '86 USD', trend: '+11 USD', icon: 'cash-outline', tone: 'sun' },
    { label: 'Ingresos totales', value: '110,424 USD', trend: '+22% mensual', icon: 'analytics-outline', tone: 'coral' }
  ]);

  protected readonly weeklyData = signal([
    { day: 'Lun', count: 42, percentage: 70 }, { day: 'Mar', count: 38, percentage: 63 },
    { day: 'Mie', count: 55, percentage: 92 }, { day: 'Jue', count: 60, percentage: 100 },
    { day: 'Vie', count: 48, percentage: 80 }, { day: 'Sab', count: 35, percentage: 58 },
    { day: 'Dom', count: 28, percentage: 47 }
  ]);

  protected readonly topDestinations = signal([
    { name: 'La Habana', bookings: 456, trend: 12 }, { name: 'Varadero', bookings: 389, trend: 8 },
    { name: 'Trinidad', bookings: 234, trend: 15 }, { name: 'Vinales', bookings: 198, trend: -3 }
  ]);

  protected readonly inventoryItems = signal<InventoryItem[]>([
    { id: '1', name: 'Hotel Prado Boutique', type: 'Hotel', status: 'available', occupancy: 85, nextBooking: '25 Jun 2026' },
    { id: '2', name: 'Hostal Patio Colonial', type: 'Hostal', status: 'booked', occupancy: 100, nextBooking: null },
    { id: '3', name: 'Villa Mogote Verde', type: 'Villa', status: 'available', occupancy: 60, nextBooking: '28 Jun 2026' },
    { id: '4', name: 'Costa Clara Resort', type: 'Hotel', status: 'maintenance', occupancy: 0, nextBooking: null }
  ]);

  protected readonly currentMonthYear = computed(() => this.currentDate().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
  protected readonly calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() || 7;
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; bookings: number }> = [];
    const today = new Date();

    for (let day = startDay - 1; day > 0; day--) days.push({ date: new Date(year, month, -day + 1), isCurrentMonth: false, isToday: false, bookings: 0 });
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const calendarDate = new Date(year, month, day);
      days.push({ date: calendarDate, isCurrentMonth: true, isToday: calendarDate.toDateString() === today.toDateString(), bookings: (day * 3 + month) % 6 });
    }
    for (let day = 1; days.length < 42; day++) days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false, isToday: false, bookings: 0 });
    return days;
  });

  constructor() {
    addIcons({ addOutline, analyticsOutline, arrowForwardOutline, bedOutline, calendarOutline, cashOutline, checkmarkCircleOutline, cubeOutline, refreshOutline, trendingUpOutline });
  }

  protected refreshData(): void { this.refreshedAt.set('Actualizado hace unos segundos'); }
  protected previousMonth(): void { this.currentDate.update(date => new Date(date.getFullYear(), date.getMonth() - 1, 1)); }
  protected nextMonth(): void { this.currentDate.update(date => new Date(date.getFullYear(), date.getMonth() + 1, 1)); }
  protected statusLabel(status: InventoryItem['status']): string { return { available: 'Disponible', booked: 'Ocupado', maintenance: 'Mantenimiento' }[status]; }
}
