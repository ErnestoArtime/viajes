import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { FeatureFlagsService } from './feature-flags.service';
import {
  CommercialPlanId,
  ProductModuleId,
  TenantProductConfig,
  commercialPlans,
  defaultTenantProductConfig,
  featureFlagsForModules
} from './product-catalog.model';

const STORAGE_KEY = 'viajes:tenant-product-config';

@Injectable({ providedIn: 'root' })
export class TenantProductService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly featureFlags = inject(FeatureFlagsService);
  private readonly canPersist = isPlatformBrowser(this.platformId);
  private readonly _config = signal<TenantProductConfig>(this.load());

  readonly config = this._config.asReadonly();
  readonly activePlan = computed(() => commercialPlans.find(plan => plan.id === this._config().planId) ?? commercialPlans[1]);
  readonly monthlyAddOnsUsd = computed(() => this._config().enabledModules
    .filter(moduleId => !this.activePlan().includedModules.includes(moduleId))
    .reduce((total, moduleId) => total + (this.modulePrice(moduleId) ?? 0), 0));

  constructor() {
    // A tenant profile is the source of truth for the route-level capabilities.
    this.syncFeatureFlags();
  }

  applyPlan(planId: CommercialPlanId): void {
    const plan = commercialPlans.find(item => item.id === planId);
    if (!plan) return;

    this._config.update(config => ({
      ...config,
      planId,
      enabledModules: [...plan.includedModules]
    }));
    this.syncFeatureFlags();
  }

  toggleModule(moduleId: ProductModuleId): void {
    const included = this.activePlan().includedModules.includes(moduleId);
    if (included) return;

    this._config.update(config => ({
      ...config,
      enabledModules: config.enabledModules.includes(moduleId)
        ? config.enabledModules.filter(id => id !== moduleId)
        : [...config.enabledModules, moduleId]
    }));
    this.syncFeatureFlags();
  }

  updateBranding(branding: Partial<TenantProductConfig['branding']>): void {
    this._config.update(config => ({ ...config, branding: { ...config.branding, ...branding } }));
    this.persist();
  }

  toggleDeploymentTarget(target: TenantProductConfig['deploymentTargets'][number]): void {
    this._config.update(config => ({
      ...config,
      deploymentTargets: config.deploymentTargets.includes(target)
        ? config.deploymentTargets.filter(item => item !== target)
        : [...config.deploymentTargets, target]
    }));
    this.persist();
  }

  reset(): void {
    this._config.set(structuredClone(defaultTenantProductConfig));
    this.syncFeatureFlags();
  }

  private modulePrice(moduleId: ProductModuleId): number | undefined {
    // Kept local so the price calculation stays independent from UI concerns.
    return (awaitableModulePrice[moduleId]);
  }

  private syncFeatureFlags(): void {
    this.featureFlags.updateFlags(featureFlagsForModules(this._config().enabledModules));
    this.persist();
  }

  private load(): TenantProductConfig {
    if (!this.canPersist) return structuredClone(defaultTenantProductConfig);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultTenantProductConfig);

    try {
      const saved = JSON.parse(raw) as Partial<TenantProductConfig>;
      return {
        ...structuredClone(defaultTenantProductConfig),
        ...saved,
        branding: { ...defaultTenantProductConfig.branding, ...saved.branding },
        enabledModules: saved.enabledModules ?? [...defaultTenantProductConfig.enabledModules],
        deploymentTargets: saved.deploymentTargets ?? [...defaultTenantProductConfig.deploymentTargets]
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return structuredClone(defaultTenantProductConfig);
    }
  }

  private persist(): void {
    if (this.canPersist) localStorage.setItem(STORAGE_KEY, JSON.stringify(this._config()));
  }
}

const awaitableModulePrice: Record<ProductModuleId, number> = {
  catalog: 0, booking: 0, experiences: 39, transport: 39, 'traveler-tools': 29,
  'operator-suite': 49, localization: 29, 'content-seo': 29, integrations: 59,
  analytics: 79, loyalty: 39
};
