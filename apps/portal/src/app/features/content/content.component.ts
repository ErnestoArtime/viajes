import { Component, inject, signal } from '@angular/core';
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
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  imageOutline,
  chatbubblesOutline,
  eyeOutline,
  calendarOutline,
  personOutline
} from 'ionicons/icons';
import { FeatureFlagsService } from '@viajes/tenant-config';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: Date;
  category: string;
  imageUrl: string;
  readTime: string;
}

interface VirtualTour {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  duration: string;
  rating: number;
}

interface Testimonial {
  id: string;
  name: string;
  country: string;
  avatar: string;
  comment: string;
  rating: number;
  date: Date;
  verified: boolean;
}

@Component({
  selector: 'viajes-content',
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
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="document-text-outline"></ion-icon>
          Contenido y Marketing
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (featureFlags().content.enabled) {
        <ion-segment [value]="activeTab()" (ionChange)="updateTab($event.detail.value)">
          @if (featureFlags().content.blog) {
            <ion-segment-button value="blog">
              <ion-label>Blog</ion-label>
            </ion-segment-button>
          }
          @if (featureFlags().content.virtualTours) {
            <ion-segment-button value="tours">
              <ion-label>Tours Virtuales</ion-label>
            </ion-segment-button>
          }
          @if (featureFlags().content.travelerTestimonials) {
            <ion-segment-button value="testimonials">
              <ion-label>Testimonios</ion-label>
            </ion-segment-button>
          }
        </ion-segment>

        @switch (activeTab()) {
          @case ('blog') {
            @if (featureFlags().content.blog) {
              <div class="blog-section">
                <h2>Blog de Destinos</h2>
                <p>Descubre los mejores destinos y experiencias en Cuba.</p>

                <div class="blog-grid">
                  @for (post of blogPosts(); track post.id) {
                    <ion-card class="blog-card">
                      <img [src]="post.imageUrl" [alt]="post.title">
                      <ion-card-header>
                        <ion-chip>{{ post.category }}</ion-chip>
                        <ion-card-title>{{ post.title }}</ion-card-title>
                      </ion-card-header>
                      <ion-card-content>
                        <p>{{ post.excerpt }}</p>
                        <div class="post-meta">
                          <span class="author">
                            <ion-icon name="person-outline"></ion-icon>
                            {{ post.author }}
                          </span>
                          <span class="date">
                            <ion-icon name="calendar-outline"></ion-icon>
                            {{ post.date | date:'mediumDate' }}
                          </span>
                          <span class="read-time">
                            <ion-icon name="eye-outline"></ion-icon>
                            {{ post.readTime }}
                          </span>
                        </div>
                        <ion-button fill="clear" expand="block">
                          Leer mas
                        </ion-button>
                      </ion-card-content>
                    </ion-card>
                  }
                </div>
              </div>
            }
          }

          @case ('tours') {
            @if (featureFlags().content.virtualTours) {
              <div class="tours-section">
                <h2>Virtuales Tours 360°</h2>
                <p>Explora nuestros destinos antes de viajar.</p>

                <div class="tours-grid">
                  @for (tour of virtualTours(); track tour.id) {
                    <ion-card class="tour-card">
                      <div class="tour-preview">
                        <img [src]="tour.imageUrl" [alt]="tour.title">
                        <div class="play-button">
                          <ion-icon name="eye-outline"></ion-icon>
                        </div>
                        <div class="tour-badge">
                          <ion-icon name="eye-outline"></ion-icon>
                          360°
                        </div>
                      </div>
                      <ion-card-header>
                        <ion-card-title>{{ tour.title }}</ion-card-title>
                      </ion-card-header>
                      <ion-card-content>
                        <div class="tour-details">
                          <span class="location">
                            <ion-icon name="location-outline"></ion-icon>
                            {{ tour.location }}
                          </span>
                          <span class="duration">
                            <ion-icon name="time-outline"></ion-icon>
                            {{ tour.duration }}
                          </span>
                          <span class="rating">
                            <ion-icon name="star-outline"></ion-icon>
                            {{ tour.rating }}
                          </span>
                        </div>
                        <ion-button expand="block" fill="outline">
                          Iniciar Tour
                        </ion-button>
                      </ion-card-content>
                    </ion-card>
                  }
                </div>
              </div>
            }
          }

          @case ('testimonials') {
            @if (featureFlags().content.travelerTestimonials) {
              <div class="testimonials-section">
                <h2>Testimonios de Viajeros</h2>
                <p>Lo que dicen nuestros clientes sobre sus experiencias.</p>

                <div class="testimonials-grid">
                  @for (testimonial of testimonials(); track testimonial.id) {
                    <ion-card class="testimonial-card">
                      <ion-card-content>
                        <div class="testimonial-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <ion-icon name="star-outline" [class.filled]="star <= testimonial.rating"></ion-icon>
                          }
                        </div>
                        <p class="testimonial-comment">"{{ testimonial.comment }}"</p>
                        <div class="testimonial-author">
                          <div class="avatar">
                            <ion-icon name="person-outline"></ion-icon>
                          </div>
                          <div class="author-info">
                            <strong>{{ testimonial.name }}</strong>
                            <span>{{ testimonial.country }}</span>
                            @if (testimonial.verified) {
                              <ion-chip color="success" class="verified">
                                Verificado
                              </ion-chip>
                            }
                          </div>
                          <span class="date">{{ testimonial.date | date:'mediumDate' }}</span>
                        </div>
                      </ion-card-content>
                    </ion-card>
                  }
                </div>
              </div>
            }
          }
        }
      } @else {
        <div class="feature-disabled">
          <ion-icon name="document-text-outline"></ion-icon>
          <h3>Contenido No Disponible</h3>
          <p>Esta funcionalidad no esta habilitada para este tenant.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .blog-grid, .tours-grid, .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .blog-card img, .tour-preview img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .post-meta {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .post-meta span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .tour-preview {
      position: relative;
    }
    
    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    .play-button ion-icon {
      font-size: 2rem;
      color: white;
    }
    
    .tour-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--ion-color-primary);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .tour-details {
      display: flex;
      justify-content: space-between;
      margin: 1rem 0;
    }
    
    .tour-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
    }
    
    .testimonial-rating {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }
    
    .testimonial-rating ion-icon.filled {
      color: var(--ion-color-warning);
    }
    
    .testimonial-comment {
      font-style: italic;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar ion-icon {
      font-size: 1.5rem;
      color: white;
    }
    
    .author-info {
      flex: 1;
    }
    
    .author-info strong {
      display: block;
    }
    
    .author-info span {
      display: block;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .author-info .verified {
      margin-top: 0.25rem;
    }
    
    .date {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
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
export class ContentComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  protected readonly featureFlags = this.featureFlagsService.flags;
  protected readonly activeTab = signal<string>('blog');

  protected readonly blogPosts = signal<BlogPost[]>([
    {
      id: '1',
      title: 'Las 10 playas mas hermosas de Cuba',
      excerpt: 'Descubre las playas paradisiacas que debes visitar en tu proximo viaja a Cuba.',
      author: 'Maria Rodriguez',
      date: new Date('2026-06-20'),
      category: 'Playas',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      readTime: '5 min'
    },
    {
      id: '2',
      title: 'Gastronomia cubana: sabores que debes probar',
      excerpt: 'Una guia completa de los platos tipicos y restaurantes imperdibles.',
      author: 'Carlos Mendez',
      date: new Date('2026-06-15'),
      category: 'Gastronomia',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      readTime: '7 min'
    },
    {
      id: '3',
      title: 'La Habana nocturna: donde salir de fiesta',
      excerpt: 'Los mejores lugares para disfrutar de la vida nocturna habanera.',
      author: 'Ana Garcia',
      date: new Date('2026-06-10'),
      category: 'Vida Nocturna',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      readTime: '4 min'
    }
  ]);

  protected readonly virtualTours = signal<VirtualTour[]>([
    {
      id: '1',
      title: 'La Habana Vieja',
      location: 'La Habana',
      imageUrl: 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?auto=format&fit=crop&w=800&q=80',
      duration: '15 min',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Valle de Vinales',
      location: 'Pinar del Rio',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      duration: '20 min',
      rating: 4.9
    },
    {
      id: '3',
      title: 'Trinidad Colonial',
      location: 'Sancti Spiritus',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      duration: '12 min',
      rating: 4.7
    }
  ]);

  protected readonly testimonials = signal<Testimonial[]>([
    {
      id: '1',
      name: 'Sophie Martin',
      country: 'Francia',
      avatar: '',
      comment: 'Una experiencia increible! El tour por La Habana fue magico. Los guias eran muy amables y conocedores.',
      rating: 5,
      date: new Date('2026-06-18'),
      verified: true
    },
    {
      id: '2',
      name: 'Michael Johnson',
      country: 'Estados Unidos',
      avatar: '',
      comment: 'Excelente organizacion y atencion personalizada. Definitivamente volveremos.',
      rating: 5,
      date: new Date('2026-06-12'),
      verified: true
    },
    {
      id: '3',
      name: 'Isabella Rossi',
      country: 'Italia',
      avatar: '',
      comment: 'Cuba es un pais maravilloso. El hostal fue perfecto y el personal muy atento.',
      rating: 4,
      date: new Date('2026-06-05'),
      verified: true
    }
  ]);

  constructor() {
    addIcons({
      documentTextOutline,
      imageOutline,
      chatbubblesOutline,
      eyeOutline,
      calendarOutline,
      personOutline
    });
  }

  updateTab(value: string | number | undefined): void {
    if (typeof value === 'string') {
      this.activeTab.set(value);
    }
  }
}
