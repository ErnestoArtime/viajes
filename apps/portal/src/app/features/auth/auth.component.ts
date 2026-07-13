import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonInput,
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
  logInOutline,
  personAddOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  mailOutline,
  callOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';
import { UserRole } from '@viajes/supabase-adapter';

import { AuthService } from '../../core/services/auth.service';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  verified: boolean;
  role: UserRole;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'viajes-auth',
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
    IonInput,
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
          <ion-icon name="shield-checkmark-outline"></ion-icon>
          Autenticacion y Seguridad
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().auth.enabled) {
        @if (authState().isAuthenticated) {
          <div class="user-profile">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Mi Perfil</ion-card-title>
                <ion-chip color="success">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  Verificado
                </ion-chip>
              </ion-card-header>
              <ion-card-content>
                <div class="profile-info">
                  <div class="avatar">
                    <ion-icon name="person-outline"></ion-icon>
                  </div>
                  <div class="details">
                    <h2>{{ authState().user?.name }}</h2>
                    <p>{{ authState().user?.email }}</p>
                    @if (authState().user?.phone) {
                      <p>{{ authState().user?.phone }}</p>
                    }
                    <ion-chip [color]="getRoleColor(authState().user?.role)">
                      {{ getRoleLabel(authState().user?.role) }}
                    </ion-chip>
                  </div>
                </div>

                <div class="security-section">
                  <h3>Seguridad</h3>
                  <ion-list>
                    @if (featureFlags().auth.emailPassword) {
                      <ion-item>
                        <ion-icon name="mail-outline" slot="start"></ion-icon>
                        <ion-label>
                          <h3>Email y Contrasena</h3>
                          <p>Ultimo cambio: hace 30 dias</p>
                        </ion-label>
                        <ion-button fill="outline" slot="end">Cambiar</ion-button>
                      </ion-item>
                    }
                    @if (featureFlags().auth.otpVerification) {
                      <ion-item>
                        <ion-icon name="phone-outline" slot="start"></ion-icon>
                        <ion-label>
                          <h3>Verificacion OTP</h3>
                          <p>{{ authState().user?.phone ? 'Configurado' : 'No configurado' }}</p>
                        </ion-label>
                        <ion-button fill="outline" slot="end">
                          {{ authState().user?.phone ? 'Cambiar' : 'Configurar' }}
                        </ion-button>
                      </ion-item>
                    }
                  </ion-list>
                </div>

                <ion-button expand="block" fill="outline" color="danger" (click)="logout()">
                  Cerrar Sesion
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>
        } @else {
          <div class="auth-section">
            <ion-segment [value]="authMode()" (ionChange)="updateAuthMode($event.detail.value)">
              <ion-segment-button value="login">
                <ion-label>Iniciar Sesion</ion-label>
              </ion-segment-button>
              <ion-segment-button value="register">
                <ion-label>Registrarse</ion-label>
              </ion-segment-button>
            </ion-segment>

            @switch (authMode()) {
              @case ('login') {
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="log-in-outline"></ion-icon>
                      Iniciar Sesion
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    @if (authState().error) {
                      <div class="error-message">
                        <ion-icon name="alert-circle-outline"></ion-icon>
                        {{ authState().error }}
                      </div>
                    }

                    <ion-list>
                      @if (featureFlags().auth.emailPassword) {
                        <ion-item>
                          <ion-icon name="mail-outline" slot="start"></ion-icon>
                          <ion-input 
                            type="email" 
                            placeholder="Email"
                            [(ngModel)]="loginEmail">
                          </ion-input>
                        </ion-item>
                        <ion-item>
                          <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                          <ion-input 
                            type="password" 
                            placeholder="Contrasena"
                            [(ngModel)]="loginPassword">
                          </ion-input>
                        </ion-item>
                      }
                    </ion-list>

                    <ion-button 
                      expand="block" 
                      (click)="login()"
                      [disabled]="authState().loading">
                      {{ authState().loading ? 'Iniciando...' : 'Iniciar Sesion' }}
                    </ion-button>

                    @if (featureFlags().auth.otpVerification) {
                      <div class="otp-section">
                        <span>O inicia sesion con</span>
                        <ion-button expand="block" fill="outline" (click)="loginWithOTP()">
                          <ion-icon name="phone-outline" slot="start"></ion-icon>
                          Codigo OTP
                        </ion-button>
                      </div>
                    }
                  </ion-card-content>
                </ion-card>
              }

              @case ('register') {
                <ion-card>
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="person-add-outline"></ion-icon>
                      Crear Cuenta
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      <ion-item>
                        <ion-icon name="person-outline" slot="start"></ion-icon>
                        <ion-input 
                          type="text" 
                          placeholder="Nombre completo"
                          [(ngModel)]="registerName">
                        </ion-input>
                      </ion-item>
                      <ion-item>
                        <ion-icon name="mail-outline" slot="start"></ion-icon>
                        <ion-input 
                          type="email" 
                          placeholder="Email"
                          [(ngModel)]="registerEmail">
                        </ion-input>
                      </ion-item>
                      @if (featureFlags().auth.emailPassword) {
                        <ion-item>
                          <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                          <ion-input 
                            type="password" 
                            placeholder="Contrasena"
                            [(ngModel)]="registerPassword">
                          </ion-input>
                        </ion-item>
                      }
                      @if (featureFlags().auth.otpVerification) {
                        <ion-item>
                          <ion-icon name="phone-outline" slot="start"></ion-icon>
                          <ion-input 
                            type="tel" 
                            placeholder="Telefono (opcional)"
                            [(ngModel)]="registerPhone">
                          </ion-input>
                        </ion-item>
                      }
                    </ion-list>

                    <ion-button expand="block" (click)="register()">
                      Crear Cuenta
                    </ion-button>
                  </ion-card-content>
                </ion-card>
              }
            }
          </div>
        }

        @if (featureFlags().auth.hostVerification) {
          <ion-card class="host-verification">
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="shield-checkmark-outline"></ion-icon>
                Verificacion de Anfitriones
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>Los anfitriones deben verificar su identidad para publicar propiedades.</p>
              
              <div class="verification-steps">
                <div class="step completed">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Paso 1: Documento de identidad</span>
                </div>
                <div class="step completed">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Paso 2: Verificacion de direccion</span>
                </div>
                <div class="step pending">
                  <ion-icon name="time-outline"></ion-icon>
                  <span>Paso 3: Revision manual (24-48h)</span>
                </div>
              </div>

              <ion-button expand="block" fill="outline">
                Solicitar Verificacion
              </ion-button>
            </ion-card-content>
          </ion-card>
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="shield-checkmark-outline"></ion-icon>
          <h3>Autenticacion No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .auth-section, .user-profile {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .profile-info {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar ion-icon {
      font-size: 3rem;
      color: white;
    }
    
    .details h2 {
      margin: 0 0 0.5rem;
    }
    
    .details p {
      margin: 0.25rem 0;
      color: var(--ion-color-medium);
    }
    
    .security-section {
      margin-top: 2rem;
    }
    
    .security-section h3 {
      margin-bottom: 1rem;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--ion-color-danger-tint);
      color: var(--ion-color-danger);
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    .otp-section {
      text-align: center;
      margin-top: 1.5rem;
    }
    
    .otp-section span {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--ion-color-medium);
    }
    
    .host-verification {
      margin-top: 2rem;
    }
    
    .verification-steps {
      margin: 1rem 0;
    }
    
    .step {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--ion-color-light);
    }
    
    .step.completed ion-icon {
      color: var(--ion-color-success);
    }
    
    .step.pending ion-icon {
      color: var(--ion-color-warning);
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
export class AuthComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly authMode = signal<'login' | 'register'>('login');

  private readonly errorState = signal<string | null>(null);
  protected readonly authState = computed<AuthState>(() => {
    const profile = this.authService.profile();
    return {
      isAuthenticated: this.authService.isAuthenticated(),
      user: profile
        ? {
            id: profile.id,
            email: profile.email,
            name: profile.fullName ?? profile.email,
            verified: true,
            role: profile.role
          }
        : null,
      loading: this.authService.loading(),
      error: this.errorState()
    };
  });

  protected loginEmail = '';
  protected loginPassword = '';
  protected registerName = '';
  protected registerEmail = '';
  protected registerPassword = '';
  protected registerPhone = '';

  constructor() {
    addIcons({
      logInOutline,
      personAddOutline,
      shieldCheckmarkOutline,
      lockClosedOutline,
      mailOutline,
      callOutline,
      checkmarkCircleOutline
    });
  }

  updateAuthMode(value: string | number | undefined): void {
    if (value === 'login' || value === 'register') {
      this.authMode.set(value);
      this.errorState.set(null);
    }
  }

  async login(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorState.set('Ingresa email y contrasena.');
      return;
    }

    this.errorState.set(null);
    try {
      await this.authService.signIn(this.loginEmail, this.loginPassword);
      await this.navigateAfterAuthentication();
    } catch (error) {
      this.errorState.set(error instanceof Error ? error.message : 'No se pudo iniciar sesion.');
    }
  }

  loginWithOTP(): void {
    this.errorState.set('El acceso por codigo no esta configurado para este entorno.');
  }

  async register(): Promise<void> {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.errorState.set('Completa nombre, email y contrasena.');
      return;
    }

    this.errorState.set(null);
    try {
      await this.authService.signUp(this.registerEmail, this.registerPassword, this.registerName);
      this.errorState.set('Revisa tu correo para confirmar la cuenta antes de iniciar sesion.');
      this.authMode.set('login');
    } catch (error) {
      this.errorState.set(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      this.errorState.set(error instanceof Error ? error.message : 'No se pudo cerrar sesion.');
    }
  }

  getRoleColor(role: string | undefined): string {
    const colors: Record<string, string> = {
      traveler: 'primary',
      operator: 'secondary',
      admin: 'danger'
    };
    return colors[role || 'traveler'] || 'primary';
  }

  getRoleLabel(role: string | undefined): string {
    const labels: Record<string, string> = {
      traveler: 'Viajero',
      operator: 'Operador',
      admin: 'Administrador'
    };
    return labels[role || 'traveler'] || 'Viajero';
  }

  private async navigateAfterAuthentication(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    await this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/home');
  }
}
