import { Injectable } from '@angular/core';

import { getSupabaseClient, SupabaseConfigurationError } from '@viajes/supabase-adapter';

export type QuoteRequestStatus = 'submitted' | 'reviewing' | 'quoted' | 'accepted' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';

export interface OperatorQuoteRequest {
  id: string;
  reference: string;
  status: QuoteRequestStatus;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  notes: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OperatorRequestsRepository {
  private readonly client = getSupabaseClient();

  async list(): Promise<OperatorQuoteRequest[]> {
    if (!this.client) {
      throw new SupabaseConfigurationError();
    }

    const { data, error } = await this.client
      .from('quote_requests')
      .select('id, reference, status, check_in, check_out, adults, children, rooms, contact_name, contact_email, contact_phone, notes, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }

    return (data ?? []).map((request) => ({
      id: request.id,
      reference: request.reference,
      status: request.status as QuoteRequestStatus,
      checkIn: request.check_in,
      checkOut: request.check_out,
      adults: request.adults,
      children: request.children,
      rooms: request.rooms,
      contactName: request.contact_name,
      contactEmail: request.contact_email,
      contactPhone: request.contact_phone,
      notes: request.notes,
      createdAt: request.created_at
    }));
  }

  async transition(id: string, status: QuoteRequestStatus, note?: string): Promise<void> {
    if (!this.client) {
      throw new SupabaseConfigurationError();
    }
    const { error } = await this.client.rpc('transition_quote_request', {
      p_quote_request_id: id,
      p_to_status: status,
      p_note: note ?? null
    });
    if (error) {
      throw error;
    }
  }
}
