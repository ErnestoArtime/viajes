export interface QuoteRequestValidationItem {
  checkIn: string;
  checkOut: string;
  guests: number;
  capacity: number;
}

export function canSubmitQuoteRequest(
  items: QuoteRequestValidationItem[],
  contactName: string,
  contactEmail: string
): boolean {
  if (!items.length || !contactName.trim() || !contactEmail.trim()) {
    return false;
  }

  const [first] = items;
  return items.every((item) =>
    item.checkIn < item.checkOut &&
    item.guests > 0 &&
    item.guests <= item.capacity &&
    item.checkIn === first.checkIn &&
    item.checkOut === first.checkOut
  );
}
