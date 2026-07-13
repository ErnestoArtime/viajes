import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}

export type UserRole = 'traveler' | 'operator' | 'admin';

declare global {
  interface Window {
    __VIAJES_CONFIG__?: Partial<SupabaseRuntimeConfig>;
  }
}

export interface RepositoryPorts {
  listingsTable: string;
  reservationsTable: string;
  tenantsTable: string;
  importJobsTable: string;
  importedHotelDraftsTable: string;
  hotelSourcesTable: string;
  hotelImagesTable: string;
}

export const defaultRepositoryPorts: RepositoryPorts = {
  listingsTable: 'travel_listings',
  reservationsTable: 'reservations',
  tenantsTable: 'tenants',
  importJobsTable: 'import_jobs',
  importedHotelDraftsTable: 'imported_hotel_drafts',
  hotelSourcesTable: 'hotel_sources',
  hotelImagesTable: 'hotel_images'
};

export function isSupabaseConfigured(config: Partial<SupabaseRuntimeConfig>): config is SupabaseRuntimeConfig {
  return Boolean(config.url && config.anonKey);
}

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Supabase no esta configurado. Define VIAJES_SUPABASE_URL y VIAJES_SUPABASE_ANON_KEY en el entorno de despliegue.');
  }
}

export function getSupabaseRuntimeConfig(): Partial<SupabaseRuntimeConfig> {
  if (typeof window === 'undefined') {
    return {};
  }
  return window.__VIAJES_CONFIG__ ?? {};
}

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  const config = getSupabaseRuntimeConfig();
  client = isSupabaseConfigured(config)
    ? createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;
  return client;
}
