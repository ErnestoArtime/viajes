import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TravelListing, travelListings } from '@viajes/domain';

export interface CartItem { listingId: string; quantity: number; addedAt: string; }
export interface ItineraryItem { id: string; listingId: string; date: string; note?: string; }
export interface LocalReservation { id: string; reference: string; listingIds: string[]; createdAt: string; status: 'pending_confirmation'; }
interface TravelState { favorites: string[]; cart: CartItem[]; itinerary: ItineraryItem[]; reservations: LocalReservation[]; }

const storageKey = 'viajes-cuba:traveler-state';
const initialState: TravelState = { favorites: [], cart: [], itinerary: [], reservations: [] };

@Injectable({ providedIn: 'root' })
export class TravelStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = signal<TravelState>(this.load());
  readonly favorites = computed(() => travelListings.filter((listing) => this.state().favorites.includes(listing.id)));
  readonly cart = computed(() => this.state().cart.map((item) => ({ ...item, listing: travelListings.find((listing) => listing.id === item.listingId) })).filter((item): item is CartItem & { listing: TravelListing } => Boolean(item.listing)));
  readonly itinerary = computed(() => this.state().itinerary.map((item) => ({ ...item, listing: travelListings.find((listing) => listing.id === item.listingId) })).filter((item): item is ItineraryItem & { listing: TravelListing } => Boolean(item.listing)).sort((a, b) => a.date.localeCompare(b.date)));
  readonly cartCount = computed(() => this.state().cart.reduce((total, item) => total + item.quantity, 0));
  readonly cartTotal = computed(() => this.cart().reduce((total, item) => total + item.listing.nightlyPrice * item.quantity, 0));
  readonly reservations = computed(() => this.state().reservations);

  isFavorite(listingId: string): boolean { return this.state().favorites.includes(listingId); }
  toggleFavorite(listingId: string): void { const favorites = this.isFavorite(listingId) ? this.state().favorites.filter((id) => id !== listingId) : [...this.state().favorites, listingId]; this.commit({ ...this.state(), favorites }); }
  addToCart(listingId: string): void { const existing = this.state().cart.find((item) => item.listingId === listingId); const cart = existing ? this.state().cart.map((item) => item.listingId === listingId ? { ...item, quantity: item.quantity + 1 } : item) : [...this.state().cart, { listingId, quantity: 1, addedAt: new Date().toISOString() }]; this.commit({ ...this.state(), cart }); }
  updateQuantity(listingId: string, quantity: number): void { const cart = quantity < 1 ? this.state().cart.filter((item) => item.listingId !== listingId) : this.state().cart.map((item) => item.listingId === listingId ? { ...item, quantity } : item); this.commit({ ...this.state(), cart }); }
  addToItinerary(listingId: string, date: string): void { if (!date || this.state().itinerary.some((item) => item.listingId === listingId && item.date === date)) return; this.commit({ ...this.state(), itinerary: [...this.state().itinerary, { id: this.createId(), listingId, date }] }); }
  removeItineraryItem(id: string): void { this.commit({ ...this.state(), itinerary: this.state().itinerary.filter((item) => item.id !== id) }); }
  clearCart(): void { this.commit({ ...this.state(), cart: [] }); }
  confirmCart(): LocalReservation | undefined { if (!this.state().cart.length) return undefined; const reservation: LocalReservation = { id: this.createId(), reference: `VC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`, listingIds: this.state().cart.map((item) => item.listingId), createdAt: new Date().toISOString(), status: 'pending_confirmation' }; this.commit({ ...this.state(), cart: [], reservations: [reservation, ...this.state().reservations] }); return reservation; }

  private commit(next: TravelState): void { this.state.set(next); if (this.isBrowser) localStorage.setItem(storageKey, JSON.stringify(next)); }
  private load(): TravelState { if (!this.isBrowser) return initialState; try { const stored = localStorage.getItem(storageKey); return stored ? { ...initialState, ...JSON.parse(stored) } : initialState; } catch { return initialState; } }
  private createId(): string { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}
