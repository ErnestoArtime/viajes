import { Injectable, computed, signal } from '@angular/core';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import { getSupabaseClient, SupabaseConfigurationError, UserRole } from '@viajes/supabase-adapter';

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  tenantId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = getSupabaseClient();
  private readonly sessionState = signal<Session | null>(null);
  private readonly profileState = signal<AuthProfile | null>(null);
  private readonly loadingState = signal(true);
  private readonly readyPromise: Promise<void>;

  readonly session = this.sessionState.asReadonly();
  readonly profile = this.profileState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  constructor() {
    if (!this.client) {
      this.loadingState.set(false);
      this.readyPromise = Promise.resolve();
      return;
    }

    this.readyPromise = this.restoreSession();
    this.client.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      this.sessionState.set(session);
      this.loadingState.set(false);
      void this.loadProfile(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    this.sessionState.set(data.session);
    await this.loadProfile(data.user);
  }

  async signUp(email: string, password: string, fullName: string): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }
    this.profileState.set(null);
  }

  hasRole(roles: readonly UserRole[]): boolean {
    const role = this.profileState()?.role;
    return role !== undefined && roles.includes(role);
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  private async restoreSession(): Promise<void> {
    const client = this.requireClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      this.loadingState.set(false);
      return;
    }
    this.sessionState.set(data.session);
    await this.loadProfile(data.session?.user ?? null);
    this.loadingState.set(false);
  }

  private async loadProfile(user: User | null): Promise<void> {
    if (!user || !this.client) {
      this.profileState.set(null);
      return;
    }

    const { data } = await this.client
      .from('profiles')
      .select('id, full_name, role, tenant_id')
      .eq('id', user.id)
      .maybeSingle();

    this.profileState.set({
      id: user.id,
      email: user.email ?? '',
      fullName: data?.full_name ?? null,
      role: data?.role ?? 'traveler',
      tenantId: data?.tenant_id ?? null
    });
  }

  private requireClient() {
    if (!this.client) {
      throw new SupabaseConfigurationError();
    }
    return this.client;
  }
}
