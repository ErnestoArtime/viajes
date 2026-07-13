import { describe, expect, it } from 'vitest';

import { canSubmitQuoteRequest } from './quote-request.validation';

const item = { checkIn: '2026-07-15', checkOut: '2026-07-18', guests: 2, capacity: 2 };

describe('quote request validation', () => {
  it('requires contact data and a valid stay', () => {
    expect(canSubmitQuoteRequest([item], 'Ana Perez', 'ana@example.com', '2026-07-13')).toBe(true);
    expect(canSubmitQuoteRequest([item], '', 'ana@example.com', '2026-07-13')).toBe(false);
    expect(canSubmitQuoteRequest([item], 'Ana Perez', 'invalid-email', '2026-07-13')).toBe(false);
    expect(canSubmitQuoteRequest([{ ...item, checkOut: item.checkIn }], 'Ana Perez', 'ana@example.com', '2026-07-13')).toBe(false);
    expect(canSubmitQuoteRequest([{ ...item, checkIn: '2026-07-12', checkOut: '2026-07-14' }], 'Ana Perez', 'ana@example.com', '2026-07-13')).toBe(false);
  });

  it('requires all cart items to share the requested stay', () => {
    expect(canSubmitQuoteRequest([item, { ...item, checkOut: '2026-07-19' }], 'Ana Perez', 'ana@example.com', '2026-07-13')).toBe(false);
  });
});
