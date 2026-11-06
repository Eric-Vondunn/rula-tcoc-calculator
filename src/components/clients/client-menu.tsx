'use client';

import { useEffect, useMemo, useState } from 'react';
import { FolderOpen, Save, LogIn, LogOut, Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { useCalculator } from '@/hooks/use-calculator';
import { useClients } from '@/hooks/use-clients';
import { ClientConflictError, type ClientDetails } from '@/lib/clients/repository';
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from '@/lib/clients/supabase';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function errorMessage(e: unknown): string {
  if (e instanceof ClientConflictError) {
    return 'A teammate saved this client after you opened it. Use "Save as new client" to keep your version, or reopen the client to see theirs.';
  }
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'Something went wrong. Please try again.';
}

function fmtUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Header controls for signing in, opening, and saving clients. */
export function ClientMenu() {
  const { enabled, userEmail, current, hasUnsavedChanges, authError } = useClients();
  // Re-open the sign-in dialog if an emailed link just failed, so the reason is visible.
  const [dialog, setDialog] = useState<'signin' | 'list' | 'save' | null>(() => (authError ? 'signin' : null));

  if (!enabled || userEmail === undefined) return null;

  if (userEmail === null) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setDialog('signin')}>
          <LogIn className="h-3.5 w-3.5 mr-1.5" /> Sign in to save clients
        </Button>
        <SignInDialog open={dialog === 'signin'} onOpenChange={(o) => setDialog(o ? 'signin' : null)} />
      </>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setDialog('list')} title="Open a saved client">
        <FolderOpen className="h-3.5 w-3.5 mr-1.5" /> Clients
      </Button>
      <Button size="sm" onClick={() => setDialog('save')} title={current ? `Save ${current.details.name}` : 'Save this client'}>
        <Save className="h-3.5 w-3.5 mr-1.5" /> Save
        {hasUnsavedChanges && (
          <>
            <span aria-hidden className="ml-1.5 h-1.5 w-1.5 rounded-full bg-rula-yellow" />
            <span className="sr-only"> (unsaved changes)</span>
          </>
        )}
      </Button>
      <ClientListDialog
        open={dialog === 'list'}
        onOpenChange={(o) => setDialog(o ? 'list' : null)}
      />
      <SaveClientDialog open={dialog === 'save'} onOpenChange={(o) => setDialog(o ? 'save' : null)} />
    </>
  );
}

/** Small status line under the header showing which client is loaded. */
export function ClientStatus() {
  const { enabled, userEmail, current, hasUnsavedChanges } = useClients();
  if (!enabled || !userEmail) return null;
  return (
    <span className="text-xs text-gray-500">
      {current ? (
        <>
          Saved client: <span className="font-medium text-rula-sp3">{current.details.name}</span>
          {hasUnsavedChanges ? <span className="text-amber-600"> · unsaved changes</span> : <span> · saved {fmtUpdated(current.updatedAt)}</span>}
        </>
      ) : (
        'New client · not saved yet'
      )}
    </span>
  );
}

// ------------------------------------------------------------------
// Sign in
// ------------------------------------------------------------------

function SignInDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Sign in to save clients"
        description={`Saved clients are shared with your team. Sign in with your @${ALLOWED_EMAIL_DOMAIN} email and we'll email you a 6-digit code.`}
      >
        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}

const LAST_EMAIL_KEY = 'tcoc:lastSignInEmail';

function readLastEmail(): string {
  try { return localStorage.getItem(LAST_EMAIL_KEY) ?? ''; } catch { return ''; }
}

function rememberEmail(email: string) {
  try { localStorage.setItem(LAST_EMAIL_KEY, email); } catch { /* storage unavailable */ }
}

// Dialog contents unmount when closed, so form state resets each time it opens.
function SignInForm() {
  const { signIn, verifyCode, authError, clearAuthError } = useClients();
  const [email, setEmail] = useState(readLastEmail);
  const [code, setCode] = useState('');
  // After a failed link, go straight to the code step if we know the email.
  const [step, setStep] = useState<'email' | 'code'>(() => (authError && readLastEmail() ? 'code' : 'email'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(authError);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null); clearAuthError(); setBusy(true);
    try {
      await signIn(email);
      rememberEmail(email.trim().toLowerCase());
      setStep('code');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await verifyCode(email, code);
      // Success: the auth listener swaps the header to Clients/Save and this dialog unmounts.
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  if (step === 'code') {
    return (
      <form onSubmit={verify} className="space-y-4">
        {!error && (
          <div className="rounded-lg bg-rula-sp1 p-4 text-sm text-rula-purple">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below. It can take a minute to arrive,
            so check spam if you don&apos;t see it.
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="signin-code">6-digit code</Label>
          <Input
            id="signin-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={10}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="tracking-widest"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-3 text-xs">
            <button type="button" className="text-rula-sp3 hover:underline" onClick={() => { setError(null); setStep('email'); }}>
              Use a different email
            </button>
            <button type="button" className="text-rula-sp3 hover:underline disabled:opacity-50" disabled={busy} onClick={() => send()}>
              Send a new email
            </button>
          </div>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Sign in
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Work email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          placeholder={`you@${ALLOWED_EMAIL_DOMAIN}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="text-xs text-rula-sp3 hover:underline"
          onClick={() => {
            if (!isAllowedEmail(email)) { setError(`Enter your @${ALLOWED_EMAIL_DOMAIN} email first.`); return; }
            setError(null); setStep('code');
          }}
        >
          I already have a code
        </button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          Email me a code
        </Button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------------
// Client list
// ------------------------------------------------------------------

function ClientListDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Saved clients" description="Shared with everyone on your team." className="max-w-2xl">
        <ClientList close={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ClientList({ close }: { close: () => void }) {
  const {
    clients, loadingList, refreshClients, openClient, removeClient, startNewClient,
    current, hasUnsavedChanges, userEmail, signOut,
  } = useClients();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState<{ kind: 'open'; id: string } | { kind: 'new' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refresh the shared list each time the dialog opens.
  useEffect(() => {
    refreshClients().catch((e) => setError(errorMessage(e)));
  }, [refreshClients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.contactName, c.contactEmail, c.notes].some((f) => f.toLowerCase().includes(q))
    );
  }, [clients, query]);

  const doOpen = async (id: string) => {
    setBusyId(id); setError(null);
    try {
      await openClient(id);
      close();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const requestOpen = (id: string) => {
    if (hasUnsavedChanges && current?.id !== id) setConfirmDiscard({ kind: 'open', id });
    else doOpen(id);
  };

  const doNew = () => { startNewClient(); close(); };
  const requestNew = () => (hasUnsavedChanges ? setConfirmDiscard({ kind: 'new' }) : doNew());

  const doDelete = async (id: string) => {
    setBusyId(id); setError(null);
    try {
      await removeClient(id);
      setConfirmDeleteId(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              aria-label="Search clients"
              placeholder="Search by name, contact, or notes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={requestNew}>
            <Plus className="h-4 w-4 mr-1.5" /> New client
          </Button>
        </div>

        {confirmDiscard && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span className="flex-1">You have unsaved changes to {current?.details.name}. Discard them?</span>
            <Button size="sm" variant="outline" onClick={() => setConfirmDiscard(null)}>Keep editing</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const c = confirmDiscard; setConfirmDiscard(null);
                if (c.kind === 'new') doNew(); else doOpen(c.id);
              }}
            >
              Discard changes
            </Button>
          </div>
        )}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
          {loadingList && clients.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading clients…
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">
              {clients.length === 0 ? 'No saved clients yet. Enter a client’s details and click Save.' : 'No clients match your search.'}
            </p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${current?.id === c.id ? 'bg-rula-sp1/60' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {c.name}
                    {current?.id === c.id && <span className="ml-2 text-xs font-normal text-rula-sp3">(open)</span>}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {[c.contactName, c.contactEmail].filter(Boolean).join(' · ') || 'No contact saved'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Updated {fmtUpdated(c.updatedAt)}{c.updatedByEmail ? ` by ${c.updatedByEmail}` : ''}
                  </p>
                </div>
                {confirmDeleteId === c.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-700">Delete for everyone?</span>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                    <Button size="sm" variant="destructive" disabled={busyId === c.id} onClick={() => doDelete(c.id)}>Delete</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button size="sm" disabled={busyId === c.id} onClick={() => requestOpen(c.id)}>
                      {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Open'}
                    </Button>
                    <Button size="sm" variant="ghost" aria-label={`Delete ${c.name}`} onClick={() => setConfirmDeleteId(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Signed in as {userEmail}</span>
          <button type="button" onClick={() => { signOut(); close(); }} className="inline-flex items-center gap-1 text-rula-sp3 hover:underline">
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
    </>
  );
}

// ------------------------------------------------------------------
// Save
// ------------------------------------------------------------------

function SaveClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { current } = useClients();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={current ? `Save ${current.details.name}` : 'Save new client'}
        description="Saves the client details and everything entered in the calculator, including the Rula Engagement Plan."
      >
        <SaveClientForm close={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SaveClientForm({ close }: { close: () => void }) {
  const { state } = useCalculator();
  const { current, saveClient } = useClients();
  // Pre-filled from the calculator and the loaded client each time the dialog opens.
  const [details, setDetails] = useState<ClientDetails>(() => ({
    name: state.clientInputs.clientName || current?.details.name || '',
    contactName: current?.details.contactName ?? '',
    contactEmail: current?.details.contactEmail ?? '',
    notes: current?.details.notes ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (asNew: boolean) => {
    setSaving(true); setError(null);
    try {
      await saveClient(details, { asNew });
      close();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof ClientDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  return (
        <form
          onSubmit={(e) => { e.preventDefault(); save(false); }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="save-name">Client / employer name</Label>
            <Input id="save-name" required value={details.name} onChange={set('name')} placeholder="e.g. Acme Co" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="save-contact">Contact name</Label>
              <Input id="save-contact" value={details.contactName} onChange={set('contactName')} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="save-email">Contact email</Label>
              <Input id="save-email" type="email" value={details.contactEmail} onChange={set('contactEmail')} placeholder="jane@acme.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="save-notes">Notes</Label>
            <textarea
              id="save-notes"
              rows={4}
              value={details.notes}
              onChange={set('notes')}
              placeholder="Deal stage, decision makers, next steps…"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rula-mid"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            {current && (
              <Button type="button" variant="outline" disabled={saving} onClick={() => save(true)}>
                Save as new client
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {current ? 'Save changes' : 'Save client'}
            </Button>
          </div>
        </form>
  );
}
