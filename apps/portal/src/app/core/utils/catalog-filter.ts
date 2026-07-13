export interface CatalogFilterCandidate {
  category: string;
  name: string;
  location: string;
  province: string;
  shortDescription: string;
  tags: string[];
  capacity: number;
}

export function normalizeCatalogText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function matchesCatalogFilter(
  listing: CatalogFilterCandidate,
  filters: { category: string; province: string; guests: number; searchTerm: string }
): boolean {
  const matchesCategory = filters.category === 'all' || listing.category === filters.category;
  const matchesProvince = filters.province === 'Todas' || listing.province === filters.province;
  const matchesGuests = listing.capacity >= filters.guests;
  const haystack = normalizeCatalogText([
    listing.name,
    listing.location,
    listing.province,
    listing.shortDescription,
    ...listing.tags
  ].join(' '));
  const matchesTerm = !filters.searchTerm || haystack.includes(normalizeCatalogText(filters.searchTerm));

  return matchesCategory && matchesProvince && matchesGuests && matchesTerm;
}
