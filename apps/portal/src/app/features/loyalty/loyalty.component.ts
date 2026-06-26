import { Component, inject, signal, computed } from '@angular/core';
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
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  starOutline,
  giftOutline,
  peopleOutline,
  checkmarkCircleOutline,
  medalOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';

interface LoyaltyPoints {
  total: number;
  earned: number;
  redeemed: number;
  expiring: number;
  expiryDate: Date;
}

interface TravelerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  requirement: string;
}

interface Referral {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  date: Date;
  bonusEarned: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discount: number;
  type: 'discount' | 'upgrade' | 'experience';
}

@Component({
  selector: 'viajes-loyalty',
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
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="trophy-outline"></ion-icon>
          Programa de Fidelizacion
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().loyalty.enabled) {
        <div class="loyalty-dashboard">
          <ion-card class="points-card">
            <ion-card-header>
              <ion-card-title>Tus Puntos Viajero</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="points-display">
                <div class="total-points">
                  <span class="points-value">{{ loyaltyPoints().total }}</span>
                  <span class="points-label">Puntos Disponibles</span>
                </div>
                <div class="points-stats">
                  <div class="stat">
                    <span class="stat-value">{{ loyaltyPoints().earned }}</span>
                    <span class="stat-label">Ganados</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ loyaltyPoints().redeemed }}</span>
                    <span class="stat-label">Canjeados</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value expiring">{{ loyaltyPoints().expiring }}</span>
                    <span class="stat-label">Por expirar</span>
                  </div>
                </div>
              </div>
              
              @if (loyaltyPoints().expiring > 0) {
                <div class="expiry-notice">
                  <ion-icon name="gift-outline"></ion-icon>
                  <span>{{ loyaltyPoints().expiring }} puntos expiran el {{ loyaltyPoints().expiryDate | date:'mediumDate' }}</span>
                </div>
              }
            </ion-card-content>
          </ion-card>

          <div class="loyalty-grid">
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="medal-outline"></ion-icon>
                  Insignias de Viajero
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="badges-grid">
                  @for (badge of travelerBadges(); track badge.id) {
                    <div class="badge-item" [class.earned]="badge.earned">
                      <div class="badge-icon">
                        <ion-icon [name]="badge.icon"></ion-icon>
                      </div>
                      <div class="badge-info">
                        <strong>{{ badge.name }}</strong>
                        <p>{{ badge.description }}</p>
                        @if (badge.earned) {
                          <ion-chip color="success">
                            <ion-icon name="checkmark-circle-outline"></ion-icon>
                            Obtenida
                          </ion-chip>
                        } @else {
                          <ion-chip color="medium">
                            {{ badge.requirement }}
                          </ion-chip>
                        }
                      </div>
                    </div>
                  }
                </div>
              </ion-card-content>
            </ion-card>

            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="people-outline"></ion-icon>
                  Programa de Referidos
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="referral-info">
                  <p>Invita a amigos y gana <strong>{{ featureFlags().loyalty.referralDiscount }}%</strong> de descuento por cada referido.</p>
                  
                  <div class="referral-code">
                    <span>Tu codigo:</span>
                    <strong>VIAJES-{{ userId() }}</strong>
                    <ion-button fill="outline" size="small">
                      Copiar
                    </ion-button>
                  </div>
                </div>

                <ion-list>
                  @for (referral of referrals(); track referral.id) {
                    <ion-item>
                      <ion-label>
                        <h3>{{ referral.name }}</h3>
                        <p>{{ referral.date | date:'mediumDate' }}</p>
                      </ion-label>
                      <ion-badge slot="end" [color]="referral.status === 'completed' ? 'success' : 'warning'">
                        {{ referral.status === 'completed' ? 'Completado' : 'Pendiente' }}
                      </ion-badge>
                      @if (referral.status === 'completed') {
                        <span slot="end">+{{ referral.bonusEarned }} puntos</span>
                      }
                    </ion-item>
                  }
                </ion-list>
              </ion-card-content>
            </ion-card>

            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="gift-outline"></ion-icon>
                  Canjear Puntos
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  @for (reward of rewards(); track reward.id) {
                    <ion-item [class.disabled]="loyaltyPoints().total < reward.pointsCost">
                      <ion-label>
                        <h3>{{ reward.title }}</h3>
                        <p>{{ reward.description }}</p>
                      </ion-label>
                      <div slot="end" class="reward-cost">
                        <span class="points">{{ reward.pointsCost }} pts</span>
                        <ion-button 
                          fill="outline" 
                          size="small"
                          [disabled]="loyaltyPoints().total < reward.pointsCost"
                          (click)="redeemReward(reward)">
                          Canjear
                        </ion-button>
                      </div>
                    </ion-item>
                  }
                </ion-list>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      } @else {
        <div class="feature-disabled">
          <ion-icon name="trophy-outline"></ion-icon>
          <h3>Programa de Fidelizacion No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .loyalty-dashboard {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .points-card {
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
      color: white;
    }
    
    .points-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .total-points {
      text-align: center;
    }
    
    .points-value {
      font-size: 3rem;
      font-weight: bold;
      display: block;
    }
    
    .points-label {
      font-size: 1rem;
      opacity: 0.9;
    }
    
    .points-stats {
      display: flex;
      gap: 2rem;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      display: block;
    }
    
    .stat-value.expiring {
      color: var(--ion-color-warning);
    }
    
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .expiry-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
    }
    
    .loyalty-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1rem;
    }
    
    .badges-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .badge-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: var(--ion-color-light);
      opacity: 0.6;
    }
    
    .badge-item.earned {
      opacity: 1;
      background: var(--ion-color-success-tint);
    }
    
    .badge-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      background: var(--ion-color-primary);
      color: white;
      border-radius: 50%;
    }
    
    .badge-item.earned .badge-icon {
      background: var(--ion-color-success);
    }
    
    .badge-info {
      flex: 1;
    }
    
    .badge-info strong {
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .badge-info p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }
    
    .referral-info {
      margin-bottom: 1rem;
    }
    
    .referral-code {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    
    .reward-cost {
      text-align: right;
    }
    
    .reward-cost .points {
      display: block;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
    
    ion-item.disabled {
      opacity: 0.5;
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
export class LoyaltyComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly userId = signal('ABC123');

  protected readonly loyaltyPoints = signal<LoyaltyPoints>({
    total: 2450,
    earned: 3200,
    redeemed: 750,
    expiring: 150,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  protected readonly travelerBadges = signal<TravelerBadge[]>([
    {
      id: '1',
      name: 'Primer Viaje',
      description: 'Completaste tu primera reserva',
      icon: 'airplane-outline',
      earned: true,
      earnedDate: new Date('2026-01-15'),
      requirement: ''
    },
    {
      id: '2',
      name: 'Explorador',
      description: 'Visita 3 provincias diferentes',
      icon: 'compass-outline',
      earned: true,
      earnedDate: new Date('2026-03-20'),
      requirement: ''
    },
    {
      id: '3',
      name: 'Viajero Frecuente',
      description: 'Realiza 5 reservas',
      icon: 'repeat-outline',
      earned: false,
      requirement: '2 reservas mas'
    },
    {
      id: '4',
      name: 'Ambassador',
      description: 'Refiere 3 amigos',
      icon: 'people-outline',
      earned: false,
      requirement: '2 referidos mas'
    }
  ]);

  protected readonly referrals = signal<Referral[]>([
    {
      id: '1',
      name: 'Maria Garcia',
      status: 'completed',
      date: new Date('2026-05-10'),
      bonusEarned: 50
    },
    {
      id: '2',
      name: 'John Smith',
      status: 'pending',
      date: new Date('2026-06-01'),
      bonusEarned: 0
    }
  ]);

  protected readonly rewards = signal<Reward[]>([
    {
      id: '1',
      title: '10% Descuento',
      description: 'En tu proxima reserva de alojamiento',
      pointsCost: 500,
      discount: 10,
      type: 'discount'
    },
    {
      id: '2',
      title: 'Upgrade Gratuito',
      description: 'Upgrade a habitacion premium',
      pointsCost: 1000,
      discount: 0,
      type: 'upgrade'
    },
    {
      id: '3',
      title: 'Experiencia VIP',
      description: 'Tour privado con guia especializado',
      pointsCost: 2000,
      discount: 0,
      type: 'experience'
    }
  ]);

  constructor() {
    addIcons({
      trophyOutline,
      starOutline,
      giftOutline,
      peopleOutline,
      checkmarkCircleOutline,
      medalOutline
    });
  }

  redeemReward(reward: Reward): void {
    if (this.loyaltyPoints().total >= reward.pointsCost) {
      const confirmed = confirm(`Canjear ${reward.pointsCost} puntos por "${reward.title}"?`);
      
      if (confirmed) {
        this.loyaltyPoints.update(points => ({
          ...points,
          total: points.total - reward.pointsCost,
          redeemed: points.redeemed + reward.pointsCost
        }));
        
        alert('Recompensa canjeada exitosamente!');
      }
    }
  }
}