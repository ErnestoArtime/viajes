import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';

import { FeatureFlagsService } from '@viajes/tenant-config';

export const featureEnabledGuard: CanMatchFn = (route): boolean | UrlTree => {
  const featurePath = route.data?.['feature'] as string | undefined;
  const anyFeaturePath = route.data?.['anyFeature'] as string[] | undefined;

  if (!featurePath && !anyFeaturePath?.length) {
    return true;
  }

  const featureFlagsService = inject(FeatureFlagsService);
  const router = inject(Router);

  const isEnabled =
    Boolean(featurePath && featureFlagsService.isFeatureEnabled(featurePath)) ||
    Boolean(anyFeaturePath?.some((path) => featureFlagsService.isFeatureEnabled(path)));

  return isEnabled ? true : router.parseUrl('/home');
};
