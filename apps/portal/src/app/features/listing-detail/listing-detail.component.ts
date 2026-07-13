import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, calendarOutline, checkmarkCircleOutline, heartOutline, locationOutline, star } from 'ionicons/icons';
import { travelListings } from '@viajes/domain';
import { TravelStore } from '../../core/services/travel-store.service';

@Component({ selector: 'viajes-listing-detail', standalone: true, imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon], templateUrl: './listing-detail.component.html', styleUrl: './listing-detail.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ListingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly travelStore = inject(TravelStore);
  protected readonly listing = computed(() => { const id = this.route.snapshot.paramMap.get('id'); return travelListings.find((item) => item.id === id || item.slug === id); });
  protected itineraryDate = '';
  constructor() { addIcons({ arrowBackOutline, calendarOutline, checkmarkCircleOutline, heartOutline, locationOutline, star }); }
  protected addToItinerary(listingId: string): void { this.travelStore.addToItinerary(listingId, this.itineraryDate); }
}
