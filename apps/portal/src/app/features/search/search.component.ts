import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, locationOutline, searchOutline, star } from 'ionicons/icons';
import { ListingCategory, travelListings } from '@viajes/domain';
import { TravelStore } from '../../core/services/travel-store.service';

type SearchCategory = ListingCategory | 'all';
const categoryLabels: Record<SearchCategory, string> = { all: 'Todo', hotel: 'Hoteles', hostal: 'Hostales', villa: 'Villas', experience: 'Experiencias', transport: 'Traslados' };

@Component({ selector: 'viajes-search', standalone: true, imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon], templateUrl: './search.component.html', styleUrl: './search.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly travelStore = inject(TravelStore);
  protected readonly categoryLabels = categoryLabels;
  protected readonly categories: SearchCategory[] = ['all', 'hotel', 'hostal', 'villa'];
  protected readonly query = signal(this.route.snapshot.queryParamMap.get('destination')?.trim() ?? '');
  protected readonly selectedCategory = signal<SearchCategory>('all');
  protected readonly listings = computed(() => { const term = this.query().trim().toLowerCase(); const category = this.selectedCategory(); return travelListings.filter((listing) => (category === 'all' || listing.category === category) && (!term || [listing.name, listing.location, listing.province, ...listing.tags].join(' ').toLowerCase().includes(term))); });
  constructor() { addIcons({ heartOutline, locationOutline, searchOutline, star }); }
  protected selectCategory(category: SearchCategory): void { this.selectedCategory.set(category); }
}
