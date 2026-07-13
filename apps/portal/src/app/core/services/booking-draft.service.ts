import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import { TravelListing, travelListings } from '@viajes/domain';

export interface BookingDraftItem {
  listing: TravelListing;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
}

interface StoredBookingDraftItem {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
}

const STORAGE_KEY = 'viajes:booking-draft';

@Injectable({ providedIn: 'root' })
export class BookingDraftService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canPersist = isPlatformBrowser(this.platformId);
  private readonly itemsState = signal<BookingDraftItem[]>(this.restore());

  readonly items = this.itemsState.asReadonly();

  add(listing: TravelListing): void {
    const current = this.itemsState();
    if (current.some((item) => item.listing.id === listing.id)) {
      return;
    }

    const checkIn = new Date().toISOString().slice(0, 10);
    const checkOut = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    this.itemsState.set([...current, { listing, checkIn, checkOut, guests: 1, nights: 1 }]);
    this.persist();
  }

  update(listingId: string, changes: Partial<Omit<BookingDraftItem, 'listing'>>): void {
    this.itemsState.update((items) =>
      items.map((item) => (item.listing.id === listingId ? { ...item, ...changes } : item))
    );
    this.persist();
  }

  remove(listingId: string): void {
    this.itemsState.update((items) => items.filter((item) => item.listing.id !== listingId));
    this.persist();
  }

  clear(): void {
    this.itemsState.set([]);
    if (this.canPersist) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private restore(): BookingDraftItem[] {
    if (!this.canPersist) {
      return [];
    }

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredBookingDraftItem[];
      return stored.flatMap((item) => {
        const listing = travelListings.find((candidate) => candidate.id === item.listingId);
        return listing && this.isValidItem(item) ? [{ ...item, listing }] : [];
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private persist(): void {
    if (!this.canPersist) {
      return;
    }
    const stored: StoredBookingDraftItem[] = this.itemsState().map(({ listing, ...item }) => ({
      listingId: listing.id,
      ...item
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  private isValidItem(item: StoredBookingDraftItem): boolean {
    return Boolean(item.checkIn && item.checkOut && item.guests > 0 && item.nights > 0);
  }
}
