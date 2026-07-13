export type ListingCategory = 'hotel' | 'hostal' | 'villa' | 'experience' | 'transport';
export type PriceUnit = 'night' | 'person' | 'group' | 'vehicle';
export type SourceName =
  | 'havanatur'
  | 'havanatursa'
  | 'cubatur'
  | 'cubatravel'
  | 'cubanacan'
  | 'gaviota'
  | 'gran-caribe'
  | 'melia'
  | 'iberostar'
  | 'solways'
  | 'travelnet-cuba'
  | 'tripadvisor'
  | 'osm'
  | 'wikidata'
  | 'wikimedia'
  | 'manual'
  | 'demo';
export type LicenseStatus = 'unknown' | 'allowed' | 'needs_permission' | 'open_license' | 'demo_only';
export type ImportStatus = 'draft' | 'needs_review' | 'reviewed' | 'approved' | 'rejected';
export type SourceUsage = 'reference' | 'open-data' | 'licensed' | 'manual' | 'demo';
export type OperationalStatus = 'active' | 'temporarily_closed' | 'unknown' | 'legacy';

export interface ListingSource {
  sourceName: SourceName;
  sourceUrl?: string;
  licenseStatus: LicenseStatus;
  lastCheckedAt?: string;
  attribution?: string;
  usage?: SourceUsage;
}

export interface TravelListing {
  id: string;
  category: ListingCategory;
  name: string;
  location: string;
  province: string;
  shortDescription: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  nightlyPrice: number;
  priceUnit?: PriceUnit;
  slug?: string;
  currency: 'USD' | 'CUP';
  capacity: number;
  tags: string[];
  amenities: string[];
  manager: string;
  availabilityLabel: string;
  normalizedName?: string;
  municipality?: string;
  destination?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  stars?: number;
  brand?: string;
  operator?: string;
  operationalStatus?: OperationalStatus;
  source: ListingSource;
  sources?: ListingSource[];
}

export interface ImportedImage {
  url: string;
  sourceUrl: string;
  sourceName?: SourceName;
  author?: string;
  license?: string;
  canUsePublicly: boolean;
}

export interface ImportedHotelDraft {
  externalId: string;
  sourceName: SourceName;
  sourceUrl: string;
  name: string;
  normalizedName: string;
  province: string;
  municipality?: string;
  destination?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category: Extract<ListingCategory, 'hotel' | 'hostal' | 'villa'> | 'resort' | 'aparthotel';
  stars?: number;
  brand?: string;
  operator?: string;
  rawDescription?: string;
  rewrittenDescription: string;
  amenities: string[];
  imageCandidates: ImportedImage[];
  sources: Array<ListingSource & { scrapedAt: string }>;
  rating?: number;
  reviewCount?: number;
  nightlyPrice?: number;
  currency?: 'USD' | 'CUP' | 'EUR';
  importStatus: ImportStatus;
  operationalStatus: OperationalStatus;
  licenseStatus: LicenseStatus;
  lastCheckedAt: string;
}

export interface HotelImportSourceDefinition {
  sourceName: SourceName;
  label: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  usage: SourceUsage;
  recommendedFor: string[];
  notes: string;
}

export const recommendedHotelImportSources: HotelImportSourceDefinition[] = [
  {
    sourceName: 'osm',
    label: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org',
    priority: 'high',
    usage: 'open-data',
    recommendedFor: ['coordinates', 'address', 'municipality', 'accommodation type'],
    notes: 'Use with ODbL attribution and track derived data rules.'
  },
  {
    sourceName: 'wikidata',
    label: 'Wikidata',
    url: 'https://www.wikidata.org',
    priority: 'high',
    usage: 'open-data',
    recommendedFor: ['structured identifiers', 'coordinates', 'alternate names'],
    notes: 'Good enrichment source for factual structured data.'
  },
  {
    sourceName: 'wikimedia',
    label: 'Wikimedia Commons',
    url: 'https://commons.wikimedia.org',
    priority: 'high',
    usage: 'open-data',
    recommendedFor: ['image candidates', 'author attribution', 'license metadata'],
    notes: 'Review each file license before publishing images.'
  },
  {
    sourceName: 'cubatravel',
    label: 'CubaTravel',
    url: 'https://www.cubatravel.cu',
    priority: 'high',
    usage: 'reference',
    recommendedFor: ['destinations', 'province structure', 'tourism categories'],
    notes: 'Useful official reference; avoid copying editorial text.'
  },
  {
    sourceName: 'gaviota',
    label: 'Gaviota Hotels',
    url: 'https://www.gaviotahotels.com',
    priority: 'high',
    usage: 'reference',
    recommendedFor: ['hotel inventory', 'destinations', 'operator data'],
    notes: 'Use to identify hotels and cross-check status; do not copy photos/text without permission.'
  },
  {
    sourceName: 'melia',
    label: 'Melia Cuba',
    url: 'https://www.meliacuba.com',
    priority: 'high',
    usage: 'reference',
    recommendedFor: ['brand data', 'hotel names', 'destinations'],
    notes: 'Dynamic operator status should be tracked with lastCheckedAt.'
  },
  {
    sourceName: 'iberostar',
    label: 'Iberostar Cuba',
    url: 'https://www.iberostar.com/en/hotels/cuba/',
    priority: 'high',
    usage: 'reference',
    recommendedFor: ['brand data', 'hotel names', 'destinations'],
    notes: 'Use for cross-checking chain inventory.'
  },
  {
    sourceName: 'solways',
    label: 'Solways Cuba',
    url: 'https://www.solwayscuba.com',
    priority: 'medium',
    usage: 'reference',
    recommendedFor: ['hotel inventory', 'destinations', 'packages'],
    notes: 'Good source for detecting hotels, packages and transfers.'
  },
  {
    sourceName: 'travelnet-cuba',
    label: 'Travelnet Cuba',
    url: 'https://www.travelnetcuba.com',
    priority: 'medium',
    usage: 'reference',
    recommendedFor: ['hotel inventory', 'destinations', 'name matching'],
    notes: 'Useful for deduplication and missing hotel detection.'
  },
  {
    sourceName: 'gran-caribe',
    label: 'Gran Caribe',
    url: 'https://www.gran-caribe.com',
    priority: 'medium',
    usage: 'reference',
    recommendedFor: ['hotel inventory', 'operator data', 'destinations'],
    notes: 'Review freshness and do not copy commercial content.'
  },
  {
    sourceName: 'havanatursa',
    label: 'Havanatursa',
    url: 'https://www.havanatursa.com/home/hotel',
    priority: 'low',
    usage: 'reference',
    recommendedFor: ['manual review', 'visual reference'],
    notes: 'Landing-style page; inspect browser/API before considering automation.'
  },
  {
    sourceName: 'cubatur',
    label: 'Cubatur',
    url: 'https://www.cubatur.com',
    priority: 'low',
    usage: 'reference',
    recommendedFor: ['manual review', 'agency reference'],
    notes: 'Use cautiously unless a usable public endpoint or permission is confirmed.'
  },
  {
    sourceName: 'tripadvisor',
    label: 'Tripadvisor',
    url: 'https://www.tripadvisor.com/Hotels-g147270-Cuba-Hotels.html',
    priority: 'low',
    usage: 'reference',
    recommendedFor: ['manual popularity validation', 'review volume signals'],
    notes: 'Do not copy reviews, photos or descriptions.'
  }
];

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
  currency: 'USD' | 'CUP';
  duration: string;
  includes: string[];
  accent: 'teal' | 'coral' | 'blue' | 'forest';
}

export interface BookingMetric {
  label: string;
  value: string;
  trend: string;
}

export const travelListings: TravelListing[] = [
  {
    id: '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2001',
    category: 'hotel',
    name: 'Hotel Prado Boutique',
    location: 'Paseo del Prado',
    province: 'La Habana',
    shortDescription: 'Estancia urbana con terraza, concierge local y paquetes de ciudad.',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewCount: 214,
    nightlyPrice: 92,
    priceUnit: 'night',
    slug: 'hotel-prado-boutique',
    currency: 'USD',
    capacity: 2,
    tags: ['Centro historico', 'WiFi', 'Desayuno'],
    amenities: ['Reserva instantanea', 'Traslado aeropuerto', 'Recepcion 24h'],
    manager: 'Gestor Habana Azul',
    availabilityLabel: '8 habitaciones esta semana',
    source: {
      sourceName: 'demo',
      licenseStatus: 'demo_only',
      attribution: 'Demo con imagen externa de Unsplash para prototipo'
    }
  },
  {
    id: '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2002',
    category: 'hostal',
    name: 'Hostal Patio Colonial',
    location: 'Centro historico',
    province: 'Sancti Spiritus',
    shortDescription: 'Casa patrimonial con gestion familiar, excursiones y cenas privadas.',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewCount: 168,
    nightlyPrice: 38,
    priceUnit: 'night',
    slug: 'hostal-patio-colonial',
    currency: 'USD',
    capacity: 4,
    tags: ['Familias', 'Patio', 'Cena criolla'],
    amenities: ['Pago flexible', 'Guia local', 'Check-in temprano'],
    manager: 'Red Trinidad Viva',
    availabilityLabel: '3 habitaciones libres',
    source: {
      sourceName: 'demo',
      licenseStatus: 'demo_only',
      attribution: 'Demo con imagen externa de Unsplash para prototipo'
    }
  },
  {
    id: '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2003',
    category: 'villa',
    name: 'Villa Mogote Verde',
    location: 'Valle de Vinales',
    province: 'Pinar del Rio',
    shortDescription: 'Vista al valle, tours ecuestres y rutas naturales gestionadas en sitio.',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    reviewCount: 121,
    nightlyPrice: 64,
    priceUnit: 'night',
    slug: 'villa-mogote-verde',
    currency: 'USD',
    capacity: 6,
    tags: ['Naturaleza', 'Piscina', 'Rutas'],
    amenities: ['Experiencias incluidas', 'Cocina privada', 'Parqueo'],
    manager: 'Operador Vinales Norte',
    availabilityLabel: 'Calendario abierto',
    source: {
      sourceName: 'demo',
      licenseStatus: 'demo_only',
      attribution: 'Demo con imagen externa de Unsplash para prototipo'
    }
  },
  {
    id: '0f4d6a13-1a28-4ed1-9f79-ef6f2dcd2004',
    category: 'hotel',
    name: 'Costa Clara Resort',
    location: 'Primera linea de playa',
    province: 'Matanzas',
    shortDescription: 'Producto de sol y playa con upgrades, day pass y ventas por agencia.',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    reviewCount: 302,
    nightlyPrice: 118,
    priceUnit: 'night',
    slug: 'costa-clara-resort',
    currency: 'USD',
    capacity: 3,
    tags: ['Playa', 'Todo incluido', 'Familias'],
    amenities: ['Motor de ofertas', 'Inventario por cupos', 'Actividades nauticas'],
    manager: 'Comercial Varadero Plus',
    availabilityLabel: 'Promocion activa',
    source: {
      sourceName: 'demo',
      licenseStatus: 'demo_only',
      attribution: 'Demo con imagen externa de Unsplash para prototipo'
    }
  }
];

export const servicePackages: ServicePackage[] = [
  {
    id: 'package-city',
    title: 'Ciudad + alojamiento',
    description: 'Combina hospedaje, traslado, guia y experiencias urbanas en un solo carrito.',
    priceFrom: 145,
    currency: 'USD',
    duration: '3 dias',
    includes: ['Hotel o hostal', 'Traslados', 'Tour privado'],
    accent: 'teal'
  },
  {
    id: 'package-hostal',
    title: 'Red de hostales',
    description: 'Publica casas, reglas de comision, cupos y calendarios por gestor local.',
    priceFrom: 34,
    currency: 'USD',
    duration: 'Por noche',
    includes: ['Calendario', 'Tarifas', 'Comisiones'],
    accent: 'coral'
  },
  {
    id: 'package-services',
    title: 'Servicios turisticos',
    description: 'Gestiona excursiones, transporte, experiencias, extras y paquetes dinamicos.',
    priceFrom: 22,
    currency: 'USD',
    duration: 'Medio dia',
    includes: ['Reservas', 'Operadores', 'Voucher'],
    accent: 'blue'
  }
];

export const bookingMetrics: BookingMetric[] = [
  {
    label: 'Reservas gestionadas',
    value: '1,284',
    trend: '+18% mensual'
  },
  {
    label: 'Ocupacion media',
    value: '76%',
    trend: 'Temporada alta'
  },
  {
    label: 'Ticket promedio',
    value: '86 USD',
    trend: '+11 USD'
  }
];
