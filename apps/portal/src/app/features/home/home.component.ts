import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  bedOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  colorPaletteOutline,
  constructOutline,
  locationOutline,
  searchOutline,
  star,
  storefrontOutline
} from 'ionicons/icons';

import {
  bookingMetrics,
  ListingCategory,
  servicePackages,
  travelListings,
  TravelListing
} from '@viajes/domain';

type CatalogFilter = ListingCategory | 'all';

const categoryLabels: Record<CatalogFilter, string> = {
  all: 'Todo',
  hotel: 'Hoteles',
  hostal: 'Hostales',
  villa: 'Villas',
  experience: 'Experiencias',
  transport: 'Transporte'
};

@Component({
  selector: 'viajes-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBadge,
    IonButton,
    IonChip,
    IonContent,
    IonIcon,
    IonLabel,
    IonSegment,
    IonSegmentButton
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected readonly listings = travelListings;
  protected readonly packages = servicePackages;
  protected readonly metrics = bookingMetrics;
  protected readonly categoryLabels = categoryLabels;
  protected readonly categories: CatalogFilter[] = ['all', 'hotel', 'hostal', 'villa', 'experience', 'transport'];
  protected readonly selectedCategory = signal<CatalogFilter>('all');
  protected searchTerm = '';
  protected guests = 2;
  protected province = 'Todas';

  protected readonly provinces = ['Todas', ...new Set(this.listings.map((listing) => listing.province))];

  protected readonly filteredListings = computed(() => {
    const selected = this.selectedCategory();
    const term = this.searchTerm.trim().toLowerCase();

    return this.listings.filter((listing) => {
      const matchesCategory = selected === 'all' || listing.category === selected;
      const matchesProvince = this.province === 'Todas' || listing.province === this.province;
      const matchesGuests = listing.capacity >= this.guests;
      const matchesTerm =
        !term ||
        [listing.name, listing.location, listing.province, listing.shortDescription, ...listing.tags]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesProvince && matchesGuests && matchesTerm;
    });
  });

  constructor() {
    addIcons({
      analyticsOutline,
      bedOutline,
      calendarOutline,
      checkmarkCircleOutline,
      chevronForwardOutline,
      colorPaletteOutline,
      constructOutline,
      locationOutline,
      searchOutline,
      star,
      storefrontOutline
    });
  }

  protected updateCategory(value: string | number | undefined): void {
    if (typeof value === 'string' && value in categoryLabels) {
      this.selectedCategory.set(value as CatalogFilter);
    }
  }

  protected trackListing(_: number, listing: TravelListing): string {
    return listing.id;
  }
}
