import { describe, expect, it } from 'vitest';

import { matchesCatalogFilter, normalizeCatalogText } from './catalog-filter';

const listing = {
  category: 'villa',
  name: 'Villa Mogote Verde',
  location: 'Valle de Vinales',
  province: 'Pinar del Rio',
  shortDescription: 'Rutas naturales',
  tags: ['Naturaleza'],
  capacity: 6
};

describe('catalog filter', () => {
  it('normalizes accents in destination searches', () => {
    expect(normalizeCatalogText('Viñales')).toBe('vinales');
    expect(matchesCatalogFilter(listing, { category: 'all', province: 'Todas', guests: 2, searchTerm: 'Viñales' })).toBe(true);
  });

  it('excludes listings with insufficient capacity', () => {
    expect(matchesCatalogFilter(listing, { category: 'all', province: 'Todas', guests: 7, searchTerm: '' })).toBe(false);
  });
});
