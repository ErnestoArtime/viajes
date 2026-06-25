export interface TenantBranding {
  tenantId: string;
  productName: string;
  market: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  modules: {
    lodging: boolean;
    services: boolean;
    transport: boolean;
    agencySales: boolean;
  };
  commissionRules: {
    lodgingPercent: number;
    servicesPercent: number;
  };
}

export const defaultTenantBranding: TenantBranding = {
  tenantId: 'cuba-demo',
  productName: 'Viajes Cuba',
  market: 'Hoteles, hostales y servicios turisticos en Cuba',
  primaryColor: '#00897b',
  accentColor: '#f06c4f',
  contactEmail: 'ventas@viajes.demo',
  modules: {
    lodging: true,
    services: true,
    transport: true,
    agencySales: true
  },
  commissionRules: {
    lodgingPercent: 12,
    servicesPercent: 15
  }
};
