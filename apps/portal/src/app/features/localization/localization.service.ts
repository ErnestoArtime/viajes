import { Injectable, inject, signal, computed } from '@angular/core';
import { FeatureFlagsService } from '@viajes/tenant-config';

export interface Translation {
  [key: string]: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  
  private readonly _currentLanguage = signal<string>('es');
  private readonly _currentCurrency = signal<string>('USD');
  
  readonly currentLanguage = this._currentLanguage.asReadonly();
  readonly currentCurrency = this._currentCurrency.asReadonly();

  private readonly translations: Record<string, Translation> = {
    es: {
      'home': 'Inicio',
      'catalog': 'Catalogo',
      'bookings': 'Reservas',
      'profile': 'Perfil',
      'settings': 'Configuracion',
      'search': 'Buscar',
      'filter': 'Filtrar',
      'price': 'Precio',
      'night': 'noche',
      'guests': 'Huespedes',
      'checkIn': 'Check-in',
      'checkOut': 'Check-out',
      'bookNow': 'Reservar Ahora',
      'available': 'Disponible',
      'soldOut': 'Agotado',
      'total': 'Total',
      'tax': 'Impuesto',
      'subtotal': 'Subtotal',
      'confirm': 'Confirmar',
      'cancel': 'Cancelar',
      'save': 'Guardar',
      'edit': 'Editar',
      'delete': 'Eliminar',
      'back': 'Volver',
      'next': 'Siguiente',
      'previous': 'Anterior',
      'loading': 'Cargando...',
      'error': 'Error',
      'success': 'Exito',
      'noResults': 'Sin resultados',
      'perNight': 'por noche',
      'from': 'desde',
      'adults': 'Adultos',
      'children': 'Ninos',
      'rooms': 'Habitaciones',
      'amenities': 'Comodidades',
      'description': 'Descripcion',
      'reviews': 'Resenas',
      'location': 'Ubicacion',
      'gallery': 'Galeria',
      'similarListings': 'Alojamientos similares',
      'contactHost': 'Contactar anfitrion',
      'viewDetails': 'Ver detalles',
      'addToCart': 'Agregar al carrito',
      ' removeFromCart': 'Eliminar del carrito',
      'proceedToCheckout': 'Proceder al pago',
      'paymentMethod': 'Metodo de pago',
      'bookingConfirmed': 'Reserva confirmada',
      'cancellationPolicy': 'Politica de cancelacion',
      'flexible': 'Flexible',
      'moderate': 'Moderada',
      'strict': 'Estricta'
    },
    en: {
      'home': 'Home',
      'catalog': 'Catalog',
      'bookings': 'Bookings',
      'profile': 'Profile',
      'settings': 'Settings',
      'search': 'Search',
      'filter': 'Filter',
      'price': 'Price',
      'night': 'night',
      'guests': 'Guests',
      'checkIn': 'Check-in',
      'checkOut': 'Check-out',
      'bookNow': 'Book Now',
      'available': 'Available',
      'soldOut': 'Sold Out',
      'total': 'Total',
      'tax': 'Tax',
      'subtotal': 'Subtotal',
      'confirm': 'Confirm',
      'cancel': 'Cancel',
      'save': 'Save',
      'edit': 'Edit',
      'delete': 'Delete',
      'back': 'Back',
      'next': 'Next',
      'previous': 'Previous',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'noResults': 'No results',
      'perNight': 'per night',
      'from': 'from',
      'adults': 'Adults',
      'children': 'Children',
      'rooms': 'Rooms',
      'amenities': 'Amenities',
      'description': 'Description',
      'reviews': 'Reviews',
      'location': 'Location',
      'gallery': 'Gallery',
      'similarListings': 'Similar Listings',
      'contactHost': 'Contact Host',
      'viewDetails': 'View Details',
      'addToCart': 'Add to Cart',
      ' removeFromCart': 'Remove from Cart',
      'proceedToCheckout': 'Proceed to Checkout',
      'paymentMethod': 'Payment Method',
      'bookingConfirmed': 'Booking Confirmed',
      'cancellationPolicy': 'Cancellation Policy',
      'flexible': 'Flexible',
      'moderate': 'Moderate',
      'strict': 'Strict'
    },
    fr: {
      'home': 'Accueil',
      'catalog': 'Catalogue',
      'bookings': 'Reservations',
      'profile': 'Profil',
      'settings': 'Parametres',
      'search': 'Rechercher',
      'filter': 'Filtrer',
      'price': 'Prix',
      'night': 'nuit',
      'guests': 'Voyageurs',
      'checkIn': 'Arrivee',
      'checkOut': 'Depart',
      'bookNow': 'Reserver',
      'available': 'Disponible',
      'soldOut': 'Epuise',
      'total': 'Total',
      'tax': 'Taxe',
      'subtotal': 'Sous-total',
      'confirm': 'Confirmer',
      'cancel': 'Annuler',
      'save': 'Enregistrer',
      'edit': 'Modifier',
      'delete': 'Supprimer',
      'back': 'Retour',
      'next': 'Suivant',
      'previous': 'Precedent',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succes',
      'noResults': 'Aucun resultat',
      'perNight': 'par nuit',
      'from': 'depuis',
      'adults': 'Adultes',
      'children': 'Enfants',
      'rooms': 'Chambres',
      'amenities': 'Equipements',
      'description': 'Description',
      'reviews': 'Avis',
      'location': 'Emplacement',
      'gallery': 'Galerie',
      'similarListings': 'Annonces similaires',
      'contactHost': 'Contacter l\'hote',
      'viewDetails': 'Voir les details',
      'addToCart': 'Ajouter au panier',
      ' removeFromCart': 'Retirer du panier',
      'proceedToCheckout': 'Passer a la caisse',
      'paymentMethod': 'Mode de paiement',
      'bookingConfirmed': 'Reservation confirmee',
      'cancellationPolicy': 'Politique d\'annulation',
      'flexible': 'Flexible',
      'moderate': 'Moderee',
      'strict': 'Strict'
    }
  };

  private readonly currencies: Record<string, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', name: 'Dolar Americano', exchangeRate: 1 },
    CUP: { code: 'CUP', symbol: '₱', name: 'Peso Cubano', exchangeRate: 24.5 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 }
  };

  readonly availableLanguages = computed(() => {
    return this.featureFlagsService.multiLanguage().languages;
  });

  readonly availableCurrencies = computed(() => {
    return this.featureFlagsService.multiCurrency().currencies;
  });

  readonly translation = computed(() => {
    const lang = this._currentLanguage();
    return this.translations[lang] || this.translations['es'];
  });

  readonly currencyConfig = computed(() => {
    const code = this._currentCurrency();
    return this.currencies[code] || this.currencies['USD'];
  });

  setLanguage(lang: string): void {
    if (this.featureFlagsService.multiLanguage().languages.includes(lang)) {
      this._currentLanguage.set(lang);
      localStorage.setItem('viajes-language', lang);
    }
  }

  setCurrency(currency: string): void {
    if (this.featureFlagsService.multiCurrency().currencies.includes(currency)) {
      this._currentCurrency.set(currency);
      localStorage.setItem('viajes-currency', currency);
    }
  }

  translate(key: string): string {
    return this.translation()[key] || key;
  }

  formatPrice(amount: number, fromCurrency: string = 'USD'): string {
    const config = this.currencyConfig();
    const converted = this.convertCurrency(amount, fromCurrency, config.code);
    return `${config.symbol}${converted.toFixed(2)}`;
  }

  convertCurrency(amount: number, from: string, to: string): number {
    const fromRate = this.currencies[from]?.exchangeRate || 1;
    const toRate = this.currencies[to]?.exchangeRate || 1;
    return (amount / fromRate) * toRate;
  }

  initializeFromStorage(): void {
    const savedLang = localStorage.getItem('viajes-language');
    const savedCurrency = localStorage.getItem('viajes-currency');
    
    if (savedLang && this.availableLanguages().includes(savedLang)) {
      this._currentLanguage.set(savedLang);
    } else {
      this._currentLanguage.set(this.featureFlagsService.multiLanguage().defaultLanguage);
    }
    
    if (savedCurrency && this.availableCurrencies().includes(savedCurrency)) {
      this._currentCurrency.set(savedCurrency);
    } else {
      this._currentCurrency.set(this.featureFlagsService.multiCurrency().defaultCurrency);
    }
  }
}