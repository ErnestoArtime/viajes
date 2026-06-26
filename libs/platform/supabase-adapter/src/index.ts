export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
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
