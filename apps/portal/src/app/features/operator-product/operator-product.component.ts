import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, cubeOutline, globeOutline, layersOutline, phonePortraitOutline, rocketOutline, settingsOutline, storefrontOutline } from 'ionicons/icons';
import { CommercialPlanId, ProductModuleId, TenantProductService, commercialPlans, productModules } from '@viajes/tenant-config';

@Component({
  selector: 'viajes-operator-product',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
  templateUrl: './operator-product.component.html',
  styleUrl: './operator-product.component.scss'
})
export class OperatorProductComponent {
  private readonly productService = inject(TenantProductService);

  protected readonly config = this.productService.config;
  protected readonly activePlan = this.productService.activePlan;
  protected readonly monthlyAddOnsUsd = this.productService.monthlyAddOnsUsd;
  protected readonly plans = commercialPlans;
  protected readonly modules = productModules;
  protected readonly enabledModuleCount = computed(() => this.config().enabledModules.length);
  protected readonly estimatedMonthlyUsd = computed(() => this.activePlan().monthlyFromUsd + this.monthlyAddOnsUsd());

  constructor() {
    addIcons({ checkmarkCircleOutline, cubeOutline, globeOutline, layersOutline, phonePortraitOutline, rocketOutline, settingsOutline, storefrontOutline });
  }

  protected selectPlan(planId: CommercialPlanId): void {
    this.productService.applyPlan(planId);
  }

  protected toggleModule(moduleId: ProductModuleId): void {
    this.productService.toggleModule(moduleId);
  }

  protected isIncluded(moduleId: ProductModuleId): boolean {
    return this.activePlan().includedModules.includes(moduleId);
  }

  protected isEnabled(moduleId: ProductModuleId): boolean {
    return this.config().enabledModules.includes(moduleId);
  }

  protected updateProductName(value: string): void {
    this.productService.updateBranding({ productName: value });
  }

  protected updateMarket(value: string): void {
    this.productService.updateBranding({ market: value });
  }

  protected updateContact(value: string): void {
    this.productService.updateBranding({ contactEmail: value });
  }

  protected updatePrimaryColor(value: string): void {
    this.productService.updateBranding({ primaryColor: value });
  }

  protected updateAccentColor(value: string): void {
    this.productService.updateBranding({ accentColor: value });
  }

  protected toggleTarget(target: 'web' | 'pwa' | 'android' | 'ios'): void {
    this.productService.toggleDeploymentTarget(target);
  }

  protected targetEnabled(target: 'web' | 'pwa' | 'android' | 'ios'): boolean {
    return this.config().deploymentTargets.includes(target);
  }

  protected reset(): void {
    this.productService.reset();
  }
}
