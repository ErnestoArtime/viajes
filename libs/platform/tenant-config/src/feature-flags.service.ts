import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { FeatureFlags, defaultFeatureFlags } from './feature-flags.model';

const STORAGE_KEY = 'viajes:cuba-demo:feature-flags';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canPersist = isPlatformBrowser(this.platformId);
  private readonly _flags = signal<FeatureFlags>(this.loadInitialFlags());
  
  readonly flags = this._flags.asReadonly();
  
  readonly booking = computed(() => this._flags().booking);
  readonly operatorDashboard = computed(() => this._flags().operatorDashboard);
  readonly travelerExperience = computed(() => this._flags().travelerExperience);
  readonly multiLanguage = computed(() => this._flags().multiLanguage);
  readonly multiCurrency = computed(() => this._flags().multiCurrency);
  readonly loyalty = computed(() => this._flags().loyalty);
  readonly integrations = computed(() => this._flags().integrations);
  readonly auth = computed(() => this._flags().auth);
  readonly transport = computed(() => this._flags().transport);
  readonly content = computed(() => this._flags().content);
  readonly analytics = computed(() => this._flags().analytics);

  isFeatureEnabled(featurePath: string): boolean {
    const parts = featurePath.split('.');
    let current: unknown = this._flags();
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return false;
      }
    }
    
    return current === true;
  }

  updateFlags(flags: Partial<FeatureFlags>): void {
    this._flags.update(current => ({
      ...current,
      ...flags
    }));
    this.persistFlags();
  }

  updateBookingFlags(flags: Partial<FeatureFlags['booking']>): void {
    this._flags.update(current => ({
      ...current,
      booking: { ...current.booking, ...flags }
    }));
    this.persistFlags();
  }

  updateOperatorDashboardFlags(flags: Partial<FeatureFlags['operatorDashboard']>): void {
    this._flags.update(current => ({
      ...current,
      operatorDashboard: { ...current.operatorDashboard, ...flags }
    }));
    this.persistFlags();
  }

  updateTravelerExperienceFlags(flags: Partial<FeatureFlags['travelerExperience']>): void {
    this._flags.update(current => ({
      ...current,
      travelerExperience: { ...current.travelerExperience, ...flags }
    }));
    this.persistFlags();
  }

  updateMultiLanguageFlags(flags: Partial<FeatureFlags['multiLanguage']>): void {
    this._flags.update(current => ({
      ...current,
      multiLanguage: { ...current.multiLanguage, ...flags }
    }));
    this.persistFlags();
  }

  updateMultiCurrencyFlags(flags: Partial<FeatureFlags['multiCurrency']>): void {
    this._flags.update(current => ({
      ...current,
      multiCurrency: { ...current.multiCurrency, ...flags }
    }));
    this.persistFlags();
  }

  updateLoyaltyFlags(flags: Partial<FeatureFlags['loyalty']>): void {
    this._flags.update(current => ({
      ...current,
      loyalty: { ...current.loyalty, ...flags }
    }));
    this.persistFlags();
  }

  updateIntegrationsFlags(flags: Partial<FeatureFlags['integrations']>): void {
    this._flags.update(current => ({
      ...current,
      integrations: { ...current.integrations, ...flags }
    }));
    this.persistFlags();
  }

  updateAuthFlags(flags: Partial<FeatureFlags['auth']>): void {
    this._flags.update(current => ({
      ...current,
      auth: { ...current.auth, ...flags }
    }));
    this.persistFlags();
  }

  updateTransportFlags(flags: Partial<FeatureFlags['transport']>): void {
    this._flags.update(current => ({
      ...current,
      transport: { ...current.transport, ...flags }
    }));
    this.persistFlags();
  }

  updateContentFlags(flags: Partial<FeatureFlags['content']>): void {
    this._flags.update(current => ({
      ...current,
      content: { ...current.content, ...flags }
    }));
    this.persistFlags();
  }

  updateAnalyticsFlags(flags: Partial<FeatureFlags['analytics']>): void {
    this._flags.update(current => ({
      ...current,
      analytics: { ...current.analytics, ...flags }
    }));
    this.persistFlags();
  }

  resetFlags(): void {
    this._flags.set(structuredClone(defaultFeatureFlags));
    this.persistFlags();
  }

  private loadInitialFlags(): FeatureFlags {
    if (!this.canPersist) {
      return structuredClone(defaultFeatureFlags);
    }

    const rawFlags = localStorage.getItem(STORAGE_KEY);

    if (!rawFlags) {
      return structuredClone(defaultFeatureFlags);
    }

    try {
      return this.mergeFeatureFlags(defaultFeatureFlags, JSON.parse(rawFlags) as Partial<FeatureFlags>);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return structuredClone(defaultFeatureFlags);
    }
  }

  private persistFlags(): void {
    if (this.canPersist) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._flags()));
    }
  }

  private mergeFeatureFlags(defaults: FeatureFlags, saved: Partial<FeatureFlags>): FeatureFlags {
    return {
      booking: { ...defaults.booking, ...saved.booking },
      operatorDashboard: { ...defaults.operatorDashboard, ...saved.operatorDashboard },
      travelerExperience: { ...defaults.travelerExperience, ...saved.travelerExperience },
      multiLanguage: { ...defaults.multiLanguage, ...saved.multiLanguage },
      multiCurrency: { ...defaults.multiCurrency, ...saved.multiCurrency },
      loyalty: { ...defaults.loyalty, ...saved.loyalty },
      integrations: { ...defaults.integrations, ...saved.integrations },
      auth: { ...defaults.auth, ...saved.auth },
      transport: { ...defaults.transport, ...saved.transport },
      content: { ...defaults.content, ...saved.content },
      analytics: { ...defaults.analytics, ...saved.analytics }
    };
  }
}
