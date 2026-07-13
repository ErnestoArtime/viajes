import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBadge, IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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
  imports: [CommonModule, FormsModule, IonBadge, IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar],
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
            @if (request.status === 'reviewing') { <ion-button slot="end" size="small" (click)="prepareQuote(request)">Preparar cotizacion</ion-button> }
          </ion-item>
          @if (quoteRequestId() === request.id) {
            <section class="quote-editor" aria-label="Crear cotizacion">
              <ion-input type="number" min="0" label="Importe" labelPlacement="stacked" [ngModel]="quoteAmount()" (ngModelChange)="quoteAmount.set(positiveAmount($event))"></ion-input>
              <ion-select label="Moneda" labelPlacement="stacked" [ngModel]="quoteCurrency()" (ngModelChange)="quoteCurrency.set($event)"><ion-select-option value="USD">USD</ion-select-option><ion-select-option value="CUP">CUP</ion-select-option><ion-select-option value="EUR">EUR</ion-select-option></ion-select>
              <ion-input type="datetime-local" label="Vigencia" labelPlacement="stacked" [ngModel]="quoteExpiresAt()" (ngModelChange)="quoteExpiresAt.set($event)"></ion-input>
              <ion-textarea label="Condiciones" labelPlacement="stacked" [ngModel]="quoteConditions()" (ngModelChange)="quoteConditions.set($event)"></ion-textarea>
              <ion-button [disabled]="quoteAmount() < 0 || !quoteExpiresAt()" (click)="createQuote(request)">Enviar cotizacion</ion-button>
            </section>
          }
        }
      </ion-list>
    </ion-content>
  `,
  styles: ['.error { color: var(--ion-color-danger); } .empty { color: var(--ion-color-medium); padding: 2rem 0; } ion-badge { margin-left: .5rem; } .quote-editor { display: grid; gap: 12px; margin: 0 16px 18px; padding: 16px; border: 1px solid var(--ion-color-light-shade); border-radius: 8px; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorRequestsComponent {
  private readonly repository = inject(OperatorRequestsRepository);
  protected readonly requests = signal<OperatorQuoteRequest[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusLabels = statusLabels;
  protected readonly quoteRequestId = signal<string | null>(null);
  protected readonly quoteAmount = signal(0);
  protected readonly quoteCurrency = signal<'USD' | 'CUP' | 'EUR'>('USD');
  protected readonly quoteExpiresAt = signal('');
  protected readonly quoteConditions = signal('');

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

  protected prepareQuote(request: OperatorQuoteRequest): void {
    this.quoteRequestId.set(request.id);
    this.quoteAmount.set(0);
    this.quoteCurrency.set('USD');
    this.quoteExpiresAt.set('');
    this.quoteConditions.set('');
  }

  protected positiveAmount(value: number | string): number {
    const amount = Number(value);
    return Number.isFinite(amount) ? Math.max(0, amount) : 0;
  }

  protected async createQuote(request: OperatorQuoteRequest): Promise<void> {
    const expiresAt = new Date(this.quoteExpiresAt());
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      this.error.set('Indica una fecha de vigencia futura.');
      return;
    }
    try {
      await this.repository.createQuote(request.id, {
        amount: this.quoteAmount(),
        currency: this.quoteCurrency(),
        expiresAt: expiresAt.toISOString(),
        conditions: this.quoteConditions().trim() || undefined
      });
      this.quoteRequestId.set(null);
      await this.load();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo crear la cotizacion.');
    }
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
