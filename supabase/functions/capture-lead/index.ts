import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const MAX_FIELD_LENGTH = 500;
const DEDUPE_WINDOW_MS = 15 * 60 * 1000;

type LeadInput = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  preferredChannel?: unknown;
  destination?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
  adults?: unknown;
  children?: unknown;
  rooms?: unknown;
  budgetMin?: unknown;
  budgetMax?: unknown;
  currency?: unknown;
  message?: unknown;
  landingPath?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  anonymousSessionId?: unknown;
  contactConsent?: unknown;
  marketingConsent?: unknown;
  legalVersion?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
};

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers: { "Content-Type": "application/json", ...headers } });

function text(value: unknown, maxLength = MAX_FIELD_LENGTH): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function date(value: unknown): string | null {
  const normalized = text(value, 10);
  return normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

function integer(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isInteger(numeric) && numeric >= 0 && numeric <= 100 ? numeric : null;
}

function amount(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= 1_000_000 ? numeric : null;
}

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cors(origin: string | null): HeadersInit | null {
  const allowedOrigins = (Deno.env.get("LEAD_ALLOWED_ORIGINS") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  if (!origin || !allowedOrigins.includes(origin)) return null;
  return { "Access-Control-Allow-Origin": origin, "Vary": "Origin" };
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) })
  });
  if (!response.ok) return false;
  return Boolean((await response.json()).success);
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const corsHeaders = cors(origin);
  if (request.method === "OPTIONS") return corsHeaders ? new Response(null, { status: 204, headers: corsHeaders }) : new Response(null, { status: 403 });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, corsHeaders ?? {});
  if (!corsHeaders) return json({ error: "origin_not_allowed" }, 403);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const tenantSlug = Deno.env.get("LEAD_DEFAULT_TENANT_SLUG");
  if (!supabaseUrl || !serviceRoleKey || !tenantSlug) return json({ error: "lead_capture_not_configured" }, 503, corsHeaders);

  let input: LeadInput;
  try {
    input = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400, corsHeaders);
  }
  if (text(input.website, 100)) return json({ error: "invalid_submission" }, 400, corsHeaders);

  const fullName = text(input.fullName, 120);
  const rawEmail = text(input.email, 254)?.toLowerCase() ?? null;
  const email = rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : null;
  const rawPhone = text(input.phone, 40);
  const phone = rawPhone?.replace(/[^\d+]/g, "") || null;
  const contactConsent = input.contactConsent === true;
  const turnstileToken = text(input.turnstileToken, 4096);
  const clientIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  if (!fullName || (!email && !phone) || !contactConsent || !turnstileToken) return json({ error: "invalid_lead" }, 400, corsHeaders);
  if (!(await verifyTurnstile(turnstileToken, clientIp))) return json({ error: "turnstile_verification_failed" }, 403, corsHeaders);

  const checkIn = date(input.checkIn);
  const checkOut = date(input.checkOut);
  if ((checkIn || checkOut) && (!checkIn || !checkOut || checkOut <= checkIn)) return json({ error: "invalid_dates" }, 400, corsHeaders);
  const adults = integer(input.adults);
  const children = integer(input.children);
  const rooms = integer(input.rooms);
  if ((input.adults !== undefined && (!adults || adults < 1)) || (input.rooms !== undefined && (!rooms || rooms < 1))) return json({ error: "invalid_party" }, 400, corsHeaders);

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("id").eq("slug", tenantSlug).maybeSingle();
  if (tenantError || !tenant) return json({ error: "tenant_not_found" }, 503, corsHeaders);

  const contactFilter = email ? `email.eq.${email}` : `phone.eq.${phone}`;
  const dedupeAfter = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  const { data: existing } = await supabase.from("leads").select("public_reference").eq("tenant_id", tenant.id).or(contactFilter).gte("created_at", dedupeAfter).limit(1).maybeSingle();
  if (existing) return json({ reference: existing.public_reference, duplicate: true }, 200, corsHeaders);

  const preferredChannel = ["email", "whatsapp", "phone"].includes(String(input.preferredChannel)) ? String(input.preferredChannel) : null;
  const currency = ["USD", "CUP", "EUR"].includes(String(input.currency)) ? String(input.currency) : null;
  const budgetMin = amount(input.budgetMin);
  const budgetMax = amount(input.budgetMax);
  if (budgetMin !== null && budgetMax !== null && budgetMax < budgetMin) return json({ error: "invalid_budget" }, 400, corsHeaders);
  const ipHash = clientIp ? await hash(`${Deno.env.get("LEAD_IP_HASH_SALT") ?? ""}:${clientIp}`) : null;

  const { data: lead, error: leadError } = await supabase.from("leads").insert({
    tenant_id: tenant.id, full_name: fullName, email, phone, preferred_channel: preferredChannel,
    destination: text(input.destination, 120), check_in: checkIn, check_out: checkOut, adults, children, rooms,
    budget_min: budgetMin, budget_max: budgetMax, currency, message: text(input.message), source: "portal",
    landing_path: text(input.landingPath, 300), referrer: text(input.referrer, 300), utm_source: text(input.utmSource, 120),
    utm_medium: text(input.utmMedium, 120), utm_campaign: text(input.utmCampaign, 120), utm_content: text(input.utmContent, 120),
    anonymous_session_id: text(input.anonymousSessionId, 36), ip_hash: ipHash
  }).select("id, public_reference").single();
  if (leadError || !lead) return json({ error: "lead_not_created" }, 500, corsHeaders);

  const legalVersion = text(input.legalVersion, 40) ?? "2026-07";
  await supabase.from("lead_events").insert({ lead_id: lead.id, event_type: "created", note: "Lead capturado desde portal" });
  await supabase.from("lead_consents").insert([
    { lead_id: lead.id, consent_type: "contact", granted: true, legal_version: legalVersion },
    { lead_id: lead.id, consent_type: "marketing", granted: input.marketingConsent === true, legal_version: legalVersion }
  ]);

  return json({ reference: lead.public_reference, duplicate: false }, 201, corsHeaders);
});
