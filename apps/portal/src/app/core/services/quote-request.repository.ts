import { Injectable } from '@angular/core';

import { getSupabaseClient, SupabaseConfigurationError } from '@viajes/supabase-adapter';

export interface QuoteRequestDraft {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  notes?: string;
  items: Array<{ listingId: string; quantity: number }>;
}

export interface SubmittedQuoteRequest {
  id: string;
  reference: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteRequestRepository {
  private readonly client = getSupabaseClient();

  async submit(draft: QuoteRequestDraft, idempotencyKey = crypto.randomUUID()): Promise<SubmittedQuoteRequest> {
    if (!this.client) {
      throw new SupabaseConfigurationError();
    }

    const { data, error } = await this.client.rpc('create_quote_request', {
      p_check_in: draft.checkIn,
      p_check_out: draft.checkOut,
      p_adults: draft.adults,
      p_children: draft.children,
      p_rooms: draft.rooms,
      p_contact_name: draft.contactName,
      p_contact_email: draft.contactEmail,
      p_contact_phone: draft.contactPhone ?? null,
      p_notes: draft.notes ?? null,
      p_idempotency_key: idempotencyKey,
      p_items: draft.items.map((item) => ({ listing_id: item.listingId, quantity: item.quantity }))
    });

    if (error) {
      throw error;
    }
    const result = data?.[0];
    if (!result) {
      throw new Error('Supabase no devolvio una referencia de solicitud.');
    }
    return result;
  }
}
