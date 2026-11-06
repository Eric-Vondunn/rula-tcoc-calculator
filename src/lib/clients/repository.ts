import type { AbsenteeismInputs, ClientInputs, ScenarioSet } from '@/types';
import type { MapState } from '@/components/sections/mutual-action-plan/types';
import { getSupabase } from './supabase';

/** Everything needed to restore the calculator for a client. */
export interface ClientSnapshot {
  version: 1;
  clientInputs: ClientInputs;
  scenarios: ScenarioSet;
  absenteeismInputs: AbsenteeismInputs;
  mapState: MapState;
}

export interface ClientDetails {
  name: string;
  contactName: string;
  contactEmail: string;
  notes: string;
}

export interface SavedClientSummary extends ClientDetails {
  id: string;
  updatedAt: string;
  updatedByEmail: string;
}

export interface SavedClient extends SavedClientSummary {
  data: ClientSnapshot;
}

interface ClientRow {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  notes: string;
  data?: ClientSnapshot;
  updated_at: string;
  updated_by_email: string;
}

const SUMMARY_COLUMNS = 'id, name, contact_name, contact_email, notes, updated_at, updated_by_email';

/** Thrown when someone else saved the client after it was loaded. */
export class ClientConflictError extends Error {
  constructor() {
    super('This client was changed by someone else since you loaded it.');
    this.name = 'ClientConflictError';
  }
}

function db() {
  const sb = getSupabase();
  if (!sb) throw new Error('Saved clients are not configured.');
  return sb;
}

function toSummary(r: ClientRow): SavedClientSummary {
  return {
    id: r.id,
    name: r.name,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    notes: r.notes,
    updatedAt: r.updated_at,
    updatedByEmail: r.updated_by_email,
  };
}

function toRow(details: ClientDetails, data: ClientSnapshot) {
  return {
    name: details.name.trim(),
    contact_name: details.contactName.trim(),
    contact_email: details.contactEmail.trim(),
    notes: details.notes,
    data,
  };
}

export async function listClients(): Promise<SavedClientSummary[]> {
  const { data, error } = await db()
    .from('clients')
    .select(SUMMARY_COLUMNS)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as ClientRow[]).map(toSummary);
}

export async function getClient(id: string): Promise<SavedClient> {
  const { data, error } = await db().from('clients').select(`${SUMMARY_COLUMNS}, data`).eq('id', id).single();
  if (error) throw error;
  const row = data as ClientRow;
  return { ...toSummary(row), data: row.data! };
}

export async function createClient(details: ClientDetails, snapshot: ClientSnapshot): Promise<SavedClientSummary> {
  const { data, error } = await db().from('clients').insert(toRow(details, snapshot)).select(SUMMARY_COLUMNS).single();
  if (error) throw error;
  return toSummary(data as ClientRow);
}

/**
 * Saves over an existing client. `expectedUpdatedAt` guards against silently
 * overwriting a teammate's newer save.
 */
export async function updateClient(
  id: string,
  details: ClientDetails,
  snapshot: ClientSnapshot,
  expectedUpdatedAt: string
): Promise<SavedClientSummary> {
  const { data, error } = await db()
    .from('clients')
    .update(toRow(details, snapshot))
    .eq('id', id)
    .eq('updated_at', expectedUpdatedAt)
    .select(SUMMARY_COLUMNS);
  if (error) throw error;
  if (!data || data.length === 0) throw new ClientConflictError();
  return toSummary(data[0] as ClientRow);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await db().from('clients').delete().eq('id', id);
  if (error) throw error;
}
