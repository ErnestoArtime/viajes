import { Injectable, computed, signal } from '@angular/core';

import { FeatureFlags, defaultFeatureFlags } from './feature-flags.model';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  private readonly _flags = signal<FeatureFlags>(structuredClone(defaultFeatureFlags));
  
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
  }

  updateBookingFlags(flags: Partial<FeatureFlags['booking']>): void {
    this._flags.update(current => ({
      ...current,
      booking: { ...current.booking, ...flags }
    }));
  }

  updateOperatorDashboardFlags(flags: Partial<FeatureFlags['operatorDashboard']>): void {
    this._flags.update(current => ({
      ...current,
      operatorDashboard: { ...current.operatorDashboard, ...flags }
    }));
  }

  updateTravelerExperienceFlags(flags: Partial<FeatureFlags['travelerExperience']>): void {
    this._flags.update(current => ({
      ...current,
      travelerExperience: { ...current.travelerExperience, ...flags }
    }));
  }

  updateMultiLanguageFlags(flags: Partial<FeatureFlags['multiLanguage']>): void {
    this._flags.update(current => ({
      ...current,
      multiLanguage: { ...current.multiLanguage, ...flags }
    }));
  }

  updateMultiCurrencyFlags(flags: Partial<FeatureFlags['multiCurrency']>): void {
    this._flags.update(current => ({
      ...current,
      multiCurrency: { ...current.multiCurrency, ...flags }
    }));
  }

  updateLoyaltyFlags(flags: Partial<FeatureFlags['loyalty']>): void {
    this._flags.update(current => ({
      ...current,
      loyalty: { ...current.loyalty, ...flags }
    }));
  }

  updateIntegrationsFlags(flags: Partial<FeatureFlags['integrations']>): void {
    this._flags.update(current => ({
      ...current,
      integrations: { ...current.integrations, ...flags }
    }));
  }

  updateAuthFlags(flags: Partial<FeatureFlags['auth']>): void {
    this._flags.update(current => ({
      ...current,
      auth: { ...current.auth, ...flags }
    }));
  }

  updateTransportFlags(flags: Partial<FeatureFlags['transport']>): void {
    this._flags.update(current => ({
      ...current,
      transport: { ...current.transport, ...flags }
    }));
  }

  updateContentFlags(flags: Partial<FeatureFlags['content']>): void {
    this._flags.update(current => ({
      ...current,
      content: { ...current.content, ...flags }
    }));
  }

  updateAnalyticsFlags(flags: Partial<FeatureFlags['analytics']>): void {
    this._flags.update(current => ({
      ...current,
      analytics: { ...current.analytics, ...flags }
    }));
  }

  resetFlags(): void {
    this._flags.set(structuredClone(defaultFeatureFlags));
  }

}
