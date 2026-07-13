import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, locationOutline, searchOutline, star } from 'ionicons/icons';
import { ListingCategory, travelListings } from '@viajes/domain';
import { TravelStore } from '../../core/services/travel-store.service';
import { matchesCatalogFilter } from '../../core/utils/catalog-filter';

type SearchCategory = ListingCategory | 'all';
const categoryLabels: Record<SearchCategory, string> = { all: 'Todo', hotel: 'Hoteles', hostal: 'Hostales', villa: 'Villas', experience: 'Experiencias', transport: 'Traslados' };

@Component({ selector: 'viajes-search', standalone: true, imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon], templateUrl: './search.component.html', styleUrl: './search.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly travelStore = inject(TravelStore);
  protected readonly categoryLabels = categoryLabels;
  protected readonly categories: SearchCategory[] = ['all', 'hotel', 'hostal', 'villa'];
  protected readonly query = signal(this.route.snapshot.queryParamMap.get('destination')?.trim() ?? '');
  protected readonly guests = signal(this.readPositiveQueryParam('guests', 1));
  protected readonly rooms = signal(this.readPositiveQueryParam('rooms', 1));
  protected readonly checkIn = signal(this.route.snapshot.queryParamMap.get('checkIn') ?? '');
  protected readonly checkOut = signal(this.route.snapshot.queryParamMap.get('checkOut') ?? '');
  protected readonly selectedCategory = signal<SearchCategory>(this.readCategoryQueryParam());
  protected readonly listings = computed(() => {
    const checkIn = this.checkIn();
    const checkOut = this.checkOut();
    if ((checkIn || checkOut) && (!checkIn || !checkOut || checkIn >= checkOut)) {
      return [];
    }
    return travelListings.filter((listing) => matchesCatalogFilter(listing, {
      category: this.selectedCategory(), province: 'Todas', guests: this.guests(), searchTerm: this.query()
    }));
  });
  constructor() { addIcons({ heartOutline, locationOutline, searchOutline, star }); }
  protected selectCategory(category: SearchCategory): void { this.selectedCategory.set(category); this.syncQueryParams(); }
  protected updateQuery(value: string): void { this.query.set(value); this.syncQueryParams(); }
  protected updateGuests(value: number): void { this.guests.set(this.positiveNumber(value)); this.syncQueryParams(); }
  protected updateRooms(value: number): void { this.rooms.set(this.positiveNumber(value)); this.syncQueryParams(); }
  protected updateCheckIn(value: string): void { this.checkIn.set(value); this.syncQueryParams(); }
  protected updateCheckOut(value: string): void { this.checkOut.set(value); this.syncQueryParams(); }

  private syncQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        destination: this.query().trim() || null,
        guests: this.guests() > 1 ? this.guests() : null,
        rooms: this.rooms() > 1 ? this.rooms() : null,
        checkIn: this.checkIn() || null,
        checkOut: this.checkOut() || null,
        category: this.selectedCategory() === 'all' ? null : this.selectedCategory()
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private readPositiveQueryParam(name: string, fallback: number): number { return this.positiveNumber(Number(this.route.snapshot.queryParamMap.get(name) ?? fallback)); }
  private readCategoryQueryParam(): SearchCategory {
    const category = this.route.snapshot.queryParamMap.get('category');
    return category && category in categoryLabels ? category as SearchCategory : 'all';
  }
  private positiveNumber(value: number): number { return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1; }
}
