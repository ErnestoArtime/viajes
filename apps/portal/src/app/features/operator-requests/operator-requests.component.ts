import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';

import { OperatorQuoteRequest, OperatorRequestsRepository, QuoteRequestStatus } from '../../core/services/operator-requests.repository';

const statusLabels: Record<QuoteRequestStatus, string> = {
  submitted: 'Enviada',
  reviewing: 'En revision',
  quoted: 'Cotizada',
  accepted: 'Aceptada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada'
};

@Component({
  selector: 'viajes-operator-requests',
  standalone: true,
  imports: [CommonModule, IonBadge, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
  template: `
    <ion-header><ion-toolbar><ion-title>Solicitudes de viaje</ion-title><ion-button slot="end" fill="clear" aria-label="Actualizar solicitudes" (click)="load()"><ion-icon name="refresh-outline"></ion-icon></ion-button></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (loading()) { <p aria-live="polite">Cargando solicitudes...</p> }
      @if (!loading() && !error() && requests().length === 0) { <p class="empty">No hay solicitudes para este operador.</p> }
      <ion-list>
        @for (request of requests(); track request.id) {
          <ion-item>
            <ion-label>
              <h2>{{ request.reference }} <ion-badge [color]="statusColor(request.status)">{{ statusLabels[request.status] }}</ion-badge></h2>
              <p>{{ request.contactName }} · {{ request.contactEmail }}</p>
              <p>{{ request.checkIn }} a {{ request.checkOut }} · {{ request.adults + request.children }} huespedes · {{ request.rooms }} habitaciones</p>
              @if (request.notes) { <p>{{ request.notes }}</p> }
            </ion-label>
            @if (request.status === 'submitted') { <ion-button slot="end" size="small" (click)="moveToReview(request)">Revisar</ion-button> }
            @if (request.status === 'reviewing') { <ion-button slot="end" size="small" (click)="markQuoted(request)">Marcar cotizada</ion-button> }
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
  styles: ['.error { color: var(--ion-color-danger); } .empty { color: var(--ion-color-medium); padding: 2rem 0; } ion-badge { margin-left: .5rem; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorRequestsComponent {
  private readonly repository = inject(OperatorRequestsRepository);
  protected readonly requests = signal<OperatorQuoteRequest[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusLabels = statusLabels;

  constructor() {
    addIcons({ refreshOutline });
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.requests.set(await this.repository.list());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar las solicitudes.');
    } finally {
      this.loading.set(false);
    }
  }

  async moveToReview(request: OperatorQuoteRequest): Promise<void> {
    await this.transition(request, 'reviewing');
  }

  async markQuoted(request: OperatorQuoteRequest): Promise<void> {
    await this.transition(request, 'quoted');
  }

  protected statusColor(status: QuoteRequestStatus): string {
    return ({ submitted: 'primary', reviewing: 'warning', quoted: 'tertiary', accepted: 'success', confirmed: 'success', completed: 'success', rejected: 'danger', cancelled: 'medium' } as Record<QuoteRequestStatus, string>)[status];
  }

  private async transition(request: OperatorQuoteRequest, status: QuoteRequestStatus): Promise<void> {
    try {
      await this.repository.transition(request.id, status);
      await this.load();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo actualizar la solicitud.');
    }
  }
}
