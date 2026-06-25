export type ListingCategory = 'hotel' | 'hostal' | 'villa' | 'experience' | 'transport';

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
  currency: 'USD' | 'CUP';
  capacity: number;
  tags: string[];
  amenities: string[];
  manager: string;
  availabilityLabel: string;
}

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
    id: 'habana-boutique-01',
    category: 'hotel',
    name: 'Hotel Prado Boutique',
    location: 'Paseo del Prado',
    province: 'La Habana',
    shortDescription: 'Estancia urbana con terraza, concierge local y paquetes de ciudad.',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewCount: 214,
    nightlyPrice: 92,
    currency: 'USD',
    capacity: 2,
    tags: ['Centro historico', 'WiFi', 'Desayuno'],
    amenities: ['Reserva instantanea', 'Traslado aeropuerto', 'Recepcion 24h'],
    manager: 'Gestor Habana Azul',
    availabilityLabel: '8 habitaciones esta semana'
  },
  {
    id: 'trinidad-hostal-02',
    category: 'hostal',
    name: 'Hostal Patio Colonial',
    location: 'Centro historico',
    province: 'Sancti Spiritus',
    shortDescription: 'Casa patrimonial con gestion familiar, excursiones y cenas privadas.',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewCount: 168,
    nightlyPrice: 38,
    currency: 'USD',
    capacity: 4,
    tags: ['Familias', 'Patio', 'Cena criolla'],
    amenities: ['Pago flexible', 'Guia local', 'Check-in temprano'],
    manager: 'Red Trinidad Viva',
    availabilityLabel: '3 habitaciones libres'
  },
  {
    id: 'vinales-villa-03',
    category: 'villa',
    name: 'Villa Mogote Verde',
    location: 'Valle de Vinales',
    province: 'Pinar del Rio',
    shortDescription: 'Vista al valle, tours ecuestres y rutas naturales gestionadas en sitio.',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    reviewCount: 121,
    nightlyPrice: 64,
    currency: 'USD',
    capacity: 6,
    tags: ['Naturaleza', 'Piscina', 'Rutas'],
    amenities: ['Experiencias incluidas', 'Cocina privada', 'Parqueo'],
    manager: 'Operador Vinales Norte',
    availabilityLabel: 'Calendario abierto'
  },
  {
    id: 'varadero-resort-04',
    category: 'hotel',
    name: 'Costa Clara Resort',
    location: 'Primera linea de playa',
    province: 'Matanzas',
    shortDescription: 'Producto de sol y playa con upgrades, day pass y ventas por agencia.',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    reviewCount: 302,
    nightlyPrice: 118,
    currency: 'USD',
    capacity: 3,
    tags: ['Playa', 'Todo incluido', 'Familias'],
    amenities: ['Motor de ofertas', 'Inventario por cupos', 'Actividades nauticas'],
    manager: 'Comercial Varadero Plus',
    availabilityLabel: 'Promocion activa'
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
