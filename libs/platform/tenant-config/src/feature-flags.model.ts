export interface FeatureFlags {
  booking: {
    enabled: boolean;
    paymentGateway: 'none' | 'paypal' | 'stripe' | 'transfer' | 'crypto';
    autoConfirm: boolean;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  };
  operatorDashboard: {
    enabled: boolean;
    realTimeMetrics: boolean;
    inventoryManagement: boolean;
    calendarView: boolean;
  };
  travelerExperience: {
    enabled: boolean;
    itineraries: boolean;
    offlineGuide: boolean;
    chatWithHosts: boolean;
    verifiedReviews: boolean;
  };
  multiLanguage: {
    enabled: boolean;
    languages: string[];
    defaultLanguage: string;
  };
  multiCurrency: {
    enabled: boolean;
    currencies: string[];
    defaultCurrency: string;
    dynamicPricing: boolean;
  };
  loyalty: {
    enabled: boolean;
    pointsPerDollar: number;
    referralDiscount: number;
    travelerBadges: boolean;
  };
  integrations: {
    googleMaps: boolean;
    whatsappBusiness: boolean;
    googleAnalytics: boolean;
    pushNotifications: boolean;
  };
  auth: {
    enabled: boolean;
    emailPassword: boolean;
    otpVerification: boolean;
    hostVerification: boolean;
  };
  transport: {
    enabled: boolean;
    privateTaxi: boolean;
    sharedTransport: boolean;
    carRental: boolean;
    airportTransfer: boolean;
  };
  content: {
    enabled: boolean;
    blog: boolean;
    virtualTours: boolean;
    travelerTestimonials: boolean;
  };
  analytics: {
    enabled: boolean;
    demandPrediction: boolean;
    priceOptimization: boolean;
    lowInventoryAlerts: boolean;
  };
}

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
  features: FeatureFlags;
  commissionRules: {
    lodgingPercent: number;
    servicesPercent: number;
    transportPercent: number;
  };
  currency: {
    symbol: string;
    code: string;
  };
}

export const defaultFeatureFlags: FeatureFlags = {
  booking: {
    enabled: true,
    paymentGateway: 'paypal',
    autoConfirm: false,
    cancellationPolicy: 'flexible'
  },
  operatorDashboard: {
    enabled: true,
    realTimeMetrics: true,
    inventoryManagement: true,
    calendarView: true
  },
  travelerExperience: {
    enabled: true,
    itineraries: true,
    offlineGuide: false,
    chatWithHosts: true,
    verifiedReviews: true
  },
  multiLanguage: {
    enabled: true,
    languages: ['es', 'en', 'fr'],
    defaultLanguage: 'es'
  },
  multiCurrency: {
    enabled: true,
    currencies: ['USD', 'CUP', 'EUR'],
    defaultCurrency: 'USD',
    dynamicPricing: true
  },
  loyalty: {
    enabled: false,
    pointsPerDollar: 10,
    referralDiscount: 10,
    travelerBadges: true
  },
  integrations: {
    googleMaps: true,
    whatsappBusiness: false,
    googleAnalytics: true,
    pushNotifications: true
  },
  auth: {
    enabled: true,
    emailPassword: true,
    otpVerification: false,
    hostVerification: true
  },
  transport: {
    enabled: true,
    privateTaxi: true,
    sharedTransport: false,
    carRental: true,
    airportTransfer: true
  },
  content: {
    enabled: true,
    blog: true,
    virtualTours: false,
    travelerTestimonials: true
  },
  analytics: {
    enabled: false,
    demandPrediction: false,
    priceOptimization: false,
    lowInventoryAlerts: true
  }
};

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
  features: defaultFeatureFlags,
  commissionRules: {
    lodgingPercent: 12,
    servicesPercent: 15,
    transportPercent: 10
  },
  currency: {
    symbol: '$',
    code: 'USD'
  }
};
