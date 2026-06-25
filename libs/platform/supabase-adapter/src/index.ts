export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}

export interface RepositoryPorts {
  listingsTable: string;
  reservationsTable: string;
  tenantsTable: string;
}

export const defaultRepositoryPorts: RepositoryPorts = {
  listingsTable: 'travel_listings',
  reservationsTable: 'reservations',
  tenantsTable: 'tenants'
};

export function isSupabaseConfigured(config: Partial<SupabaseRuntimeConfig>): config is SupabaseRuntimeConfig {
  return Boolean(config.url && config.anonKey);
}
