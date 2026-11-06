'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useCalculator, toSnapshot, applySnapshot } from '@/hooks/use-calculator';
import {
  getSupabase, isAllowedEmail, isSupabaseConfigured, ALLOWED_EMAIL_DOMAIN,
  readAuthErrorFromUrl, clearAuthParamsFromUrl,
} from '@/lib/clients/supabase';
import {
  listClients, getClient, createClient, updateClient, deleteClient,
  type ClientDetails, type SavedClientSummary,
} from '@/lib/clients/repository';

interface CurrentClient {
  id: string;
  updatedAt: string;
  details: ClientDetails;
}

interface ClientsContextValue {
  /** False when the database env vars aren't set; client features are hidden. */
  enabled: boolean;
  /** Signed-in email, or null. `undefined` while the session is loading. */
  userEmail: string | null | undefined;
  signIn: (email: string) => Promise<void>;
  /** Signs in with the 6-digit code from the sign-in email. */
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Error from a failed sign-in link, shown in the sign-in dialog. */
  authError: string | null;
  clearAuthError: () => void;

  clients: SavedClientSummary[];
  loadingList: boolean;
  refreshClients: () => Promise<void>;

  /** The saved client currently loaded, or null for an unsaved client. */
  current: CurrentClient | null;
  /** True when the calculator differs from the last save/load. */
  hasUnsavedChanges: boolean;

  openClient: (id: string) => Promise<void>;
  /** Saves over the current client, or creates one when none is loaded or `asNew` is set. */
  saveClient: (details: ClientDetails, opts?: { asNew?: boolean }) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  startNewClient: () => void;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const { state, loadSnapshot, newClient, updateClientInputs } = useCalculator();
  const enabled = isSupabaseConfigured;

  const [userEmail, setUserEmail] = useState<string | null | undefined>(enabled ? undefined : null);
  const [clients, setClients] = useState<SavedClientSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [current, setCurrent] = useState<CurrentClient | null>(null);
  const [savedJson, setSavedJson] = useState<string | null>(null);
  // Read once on load: a failed email link lands back here with an error in the URL.
  const [authError, setAuthError] = useState<string | null>(() => (enabled ? readAuthErrorFromUrl() : null));
  const clearAuthError = useCallback(() => setAuthError(null), []);

  const snapshotJson = useMemo(() => JSON.stringify(toSnapshot(state)), [state]);
  const hasUnsavedChanges = current !== null && savedJson !== snapshotJson;

  const signIn = useCallback(async (email: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Saved clients are not configured.');
    if (!isAllowedEmail(email)) throw new Error(`Use your @${ALLOWED_EMAIL_DOMAIN} email address.`);
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      if (error.status === 429 || /rate limit/i.test(error.message)) {
        throw new Error('Too many sign-in emails were sent recently. Wait a few minutes, or use the code from an email you already received.');
      }
      throw error;
    }
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Saved clients are not configured.');
    const { error } = await sb.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.replace(/\s/g, ''),
      type: 'email',
    });
    if (error) throw new Error('That code is incorrect or has expired. Request a new email and try the newest code.');
    setAuthError(null);
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setClients([]);
    setCurrent(null);
    setSavedJson(null);
  }, []);

  // ---- List -------------------------------------------------------------
  const refreshClients = useCallback(async () => {
    setLoadingList(true);
    try {
      setClients(await listClients());
    } finally {
      setLoadingList(false);
    }
  }, []);

  // ---- Auth -------------------------------------------------------------
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    // Fires once with the initial session, then on every sign-in/out.
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      setUserEmail(email);
      // Tidy the address bar once the link has been handled (success or failure).
      clearAuthParamsFromUrl();
      // Defer: Supabase calls inside this callback can deadlock the auth lock.
      if (email) setTimeout(() => { refreshClients().catch(() => {}); }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshClients]);

  // ---- Load / save ------------------------------------------------------
  const openClient = useCallback(async (id: string) => {
    const c = await getClient(id);
    // The saved name is the source of truth for the client name field.
    const restored = { ...c.data, clientInputs: { ...c.data.clientInputs, clientName: c.name } };
    loadSnapshot(restored);
    setCurrent({
      id: c.id,
      updatedAt: c.updatedAt,
      details: { name: c.name, contactName: c.contactName, contactEmail: c.contactEmail, notes: c.notes },
    });
    setSavedJson(JSON.stringify(toSnapshot(applySnapshot(state, restored))));
  }, [loadSnapshot, state]);

  const saveClient = useCallback(async (details: ClientDetails, opts?: { asNew?: boolean }) => {
    const name = details.name.trim();
    if (!name) throw new Error('Enter a client name.');
    // Keep the calculator's client name in step with the saved name.
    const snapshot = toSnapshot(state);
    snapshot.clientInputs = { ...snapshot.clientInputs, clientName: name };
    if (state.clientInputs.clientName !== name) updateClientInputs({ clientName: name });

    const saved = current && !opts?.asNew
      ? await updateClient(current.id, details, snapshot, current.updatedAt)
      : await createClient(details, snapshot);

    setCurrent({
      id: saved.id,
      updatedAt: saved.updatedAt,
      details: { name: saved.name, contactName: saved.contactName, contactEmail: saved.contactEmail, notes: saved.notes },
    });
    setSavedJson(JSON.stringify(snapshot));
    setClients((list) => [saved, ...list.filter((c) => c.id !== saved.id)]);
  }, [state, current, updateClientInputs]);

  const removeClient = useCallback(async (id: string) => {
    await deleteClient(id);
    setClients((list) => list.filter((c) => c.id !== id));
    if (current?.id === id) {
      setCurrent(null);
      setSavedJson(null);
    }
  }, [current]);

  const startNewClient = useCallback(() => {
    newClient();
    setCurrent(null);
    setSavedJson(null);
  }, [newClient]);

  const value = useMemo<ClientsContextValue>(() => ({
    enabled, userEmail, signIn, verifyCode, signOut, authError, clearAuthError,
    clients, loadingList, refreshClients,
    current, hasUnsavedChanges,
    openClient, saveClient, removeClient, startNewClient,
  }), [
    enabled, userEmail, signIn, verifyCode, signOut, authError, clearAuthError, clients, loadingList, refreshClients,
    current, hasUnsavedChanges, openClient, saveClient, removeClient, startNewClient,
  ]);

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients(): ClientsContextValue {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error('useClients must be used within a ClientsProvider');
  return ctx;
}
