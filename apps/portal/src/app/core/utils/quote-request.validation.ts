export interface QuoteRequestValidationItem {
  checkIn: string;
  checkOut: string;
  guests: number;
  capacity: number;
}

export function canSubmitQuoteRequest(
  items: QuoteRequestValidationItem[],
  contactName: string,
  contactEmail: string,
  today = new Date().toISOString().slice(0, 10)
): boolean {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());

  if (!items.length || !contactName.trim() || !validEmail) {
    return false;
  }

  const [first] = items;
  return items.every((item) =>
    item.checkIn >= today &&
    item.checkIn < item.checkOut &&
    item.guests > 0 &&
    item.guests <= item.capacity &&
    item.checkIn === first.checkIn &&
    item.checkOut === first.checkOut
  );
}
