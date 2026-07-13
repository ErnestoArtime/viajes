import { FeatureFlags, defaultFeatureFlags } from './feature-flags.model';

export type CommercialPlanId = 'essential' | 'marketplace' | 'operator-pro' | 'enterprise';
export type ProductModuleId =
  | 'catalog'
  | 'booking'
  | 'experiences'
  | 'transport'
  | 'traveler-tools'
  | 'operator-suite'
  | 'localization'
  | 'content-seo'
  | 'integrations'
  | 'analytics'
  | 'loyalty';

export interface ProductModuleDefinition {
  id: ProductModuleId;
  name: string;
  description: string;
  category: 'venta' | 'operacion' | 'crecimiento';
  monthlyAddOnUsd: number;
  deploymentImpact: string;
}

export interface CommercialPlan {
  id: CommercialPlanId;
  name: string;
  description: string;
  monthlyFromUsd: number;
  includedModules: ProductModuleId[];
  limits: {
    listings: number | 'unlimited';
    teamMembers: number | 'unlimited';
    operators: number | 'unlimited';
  };
}

export interface TenantProductConfig {
  tenantId: string;
  planId: CommercialPlanId;
  enabledModules: ProductModuleId[];
  deploymentTargets: Array<'web' | 'pwa' | 'android' | 'ios'>;
  branding: {
    productName: string;
    market: string;
    primaryColor: string;
    accentColor: string;
    contactEmail: string;
  };
}

export const productModules: ProductModuleDefinition[] = [
  { id: 'catalog', name: 'Catalogo digital', description: 'Alojamientos, fichas, galerias y destino.', category: 'venta', monthlyAddOnUsd: 0, deploymentImpact: 'Web publica' },
  { id: 'booking', name: 'Reservas', description: 'Solicitud, disponibilidad y confirmaciones.', category: 'venta', monthlyAddOnUsd: 0, deploymentImpact: 'Flujo de venta' },
  { id: 'experiences', name: 'Experiencias', description: 'Actividades locales y cupos por salida.', category: 'venta', monthlyAddOnUsd: 39, deploymentImpact: 'Catalogo ampliado' },
  { id: 'transport', name: 'Traslados', description: 'Rutas privadas, compartidas y aeropuerto.', category: 'venta', monthlyAddOnUsd: 39, deploymentImpact: 'Nueva linea de venta' },
  { id: 'traveler-tools', name: 'Mi viaje', description: 'Favoritos, itinerario, vouchers y guia.', category: 'venta', monthlyAddOnUsd: 29, deploymentImpact: 'PWA y area viajero' },
  { id: 'operator-suite', name: 'Operacion', description: 'Inventario, calendario y gestion de reservas.', category: 'operacion', monthlyAddOnUsd: 49, deploymentImpact: 'Consola privada' },
  { id: 'localization', name: 'Mercados e idiomas', description: 'Idiomas, monedas y precios por mercado.', category: 'crecimiento', monthlyAddOnUsd: 29, deploymentImpact: 'Venta internacional' },
  { id: 'content-seo', name: 'Contenido y SEO', description: 'Guias, colecciones y paginas de destino.', category: 'crecimiento', monthlyAddOnUsd: 29, deploymentImpact: 'Captacion organica' },
  { id: 'integrations', name: 'Integraciones', description: 'Mapas, WhatsApp, analitica y notificaciones.', category: 'operacion', monthlyAddOnUsd: 59, deploymentImpact: 'Conectores externos' },
  { id: 'analytics', name: 'Analitica avanzada', description: 'Alertas, demanda y optimizacion de precio.', category: 'crecimiento', monthlyAddOnUsd: 79, deploymentImpact: 'Inteligencia comercial' },
  { id: 'loyalty', name: 'Fidelizacion', description: 'Puntos, referidos y beneficios recurrentes.', category: 'crecimiento', monthlyAddOnUsd: 39, deploymentImpact: 'Retencion de viajeros' }
];

export const commercialPlans: CommercialPlan[] = [
  { id: 'essential', name: 'Esencial', description: 'Presencia digital para un operador con catalogo propio.', monthlyFromUsd: 79, includedModules: ['catalog', 'booking'], limits: { listings: 30, teamMembers: 3, operators: 1 } },
  { id: 'marketplace', name: 'Marketplace', description: 'Venta de alojamientos, actividades y traslados desde una sola marca.', monthlyFromUsd: 179, includedModules: ['catalog', 'booking', 'experiences', 'transport', 'traveler-tools', 'operator-suite'], limits: { listings: 250, teamMembers: 12, operators: 5 } },
  { id: 'operator-pro', name: 'Operador Pro', description: 'Operacion multi-servicio con mercados, contenido y conectores.', monthlyFromUsd: 349, includedModules: ['catalog', 'booking', 'experiences', 'transport', 'traveler-tools', 'operator-suite', 'localization', 'content-seo', 'integrations', 'analytics'], limits: { listings: 1000, teamMembers: 40, operators: 25 } },
  { id: 'enterprise', name: 'Enterprise', description: 'Plataforma white-label para redes, grupos hoteleros o destinos.', monthlyFromUsd: 0, includedModules: productModules.map(module => module.id), limits: { listings: 'unlimited', teamMembers: 'unlimited', operators: 'unlimited' } }
];

export const defaultTenantProductConfig: TenantProductConfig = {
  tenantId: 'cuba-demo',
  planId: 'marketplace',
  enabledModules: [...commercialPlans[1].includedModules],
  deploymentTargets: ['web', 'pwa', 'android', 'ios'],
  branding: {
    productName: 'Viajes Cuba',
    market: 'Hoteles, hostales y servicios turisticos en Cuba',
    primaryColor: '#00897b',
    accentColor: '#f06c4f',
    contactEmail: 'ventas@viajes.demo'
  }
};

export function featureFlagsForModules(moduleIds: ProductModuleId[]): FeatureFlags {
  const has = (moduleId: ProductModuleId) => moduleIds.includes(moduleId);
  const flags = structuredClone(defaultFeatureFlags);

  flags.booking.enabled = has('booking');
  flags.operatorDashboard.enabled = has('operator-suite');
  flags.operatorDashboard.realTimeMetrics = has('analytics');
  flags.travelerExperience.enabled = has('experiences');
  flags.travelerExperience.itineraries = has('traveler-tools');
  flags.travelerExperience.offlineGuide = has('traveler-tools');
  flags.travelerExperience.chatWithHosts = has('traveler-tools');
  flags.travelerExperience.verifiedReviews = has('traveler-tools');
  flags.multiLanguage.enabled = has('localization');
  flags.multiCurrency.enabled = has('localization');
  flags.multiCurrency.dynamicPricing = has('analytics');
  flags.loyalty.enabled = has('loyalty');
  flags.integrations.googleMaps = has('integrations');
  flags.integrations.whatsappBusiness = has('integrations');
  flags.integrations.googleAnalytics = has('integrations');
  flags.integrations.pushNotifications = has('integrations');
  flags.transport.enabled = has('transport');
  flags.content.enabled = has('content-seo');
  flags.content.blog = has('content-seo');
  flags.content.virtualTours = has('content-seo');
  flags.content.travelerTestimonials = has('content-seo');
  flags.analytics.enabled = has('analytics');
  flags.analytics.demandPrediction = has('analytics');
  flags.analytics.priceOptimization = has('analytics');
  flags.analytics.lowInventoryAlerts = has('analytics');

  return flags;
}
