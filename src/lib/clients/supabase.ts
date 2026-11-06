import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Whether the saved-clients database has been configured for this deployment. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Browser Supabase client, or null when the env vars aren't set. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      // Implicit flow: the emailed link signs in whichever browser opens it
      // (PKCE only works in the browser that requested the link).
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
    });
  }
  return client;
}

export const ALLOWED_EMAIL_DOMAIN = 'rula.com';

/**
 * Reads a sign-in error Supabase put in the URL after a failed email link
 * (e.g. an expired or already-used link), or null if there isn't one.
 */
export function readAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  new URLSearchParams(window.location.search).forEach((v, k) => params.set(k, v));
  const code = params.get('error_code');
  const description = params.get('error_description');
  if (!code && !description && !params.get('error')) return null;
  if (code === 'otp_expired') {
    return 'That sign-in link has expired or was already used. Some work email systems open links to scan them, which uses them up. Request a new email and enter the 6-digit code instead.';
  }
  return description ? description.replace(/\+/g, ' ') : 'Sign-in failed. Please request a new link.';
}

/** Removes Supabase auth parameters from the address bar. */
export function clearAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  ['error', 'error_code', 'error_description', 'code'].forEach((k) => url.searchParams.delete(k));
  if (/(^|&)(error|access_token)=/.test(url.hash.replace(/^#/, ''))) url.hash = '';
  window.history.replaceState(null, '', url.toString());
}

export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
