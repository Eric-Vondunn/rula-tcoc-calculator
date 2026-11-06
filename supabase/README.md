# Saved clients: Supabase setup

Saved clients are stored in Supabase and shared by everyone who signs in with a
`@rula.com` email (magic link, no passwords). Until the two environment
variables below are set, the app works exactly as before and the saved-clients
buttons are hidden.

## 1. Create the project
1. Sign up at https://supabase.com and click **New project** (the free tier is fine).
2. Pick a name (e.g. `rula-tcoc-calculator`), a database password (store it somewhere safe), and a US region.

## 2. Create the table
1. Open **SQL Editor → New query**.
2. Paste the contents of `supabase/migrations/001_clients.sql` and click **Run**.

## 3. Configure sign-in
**Authentication → URL Configuration**
- Site URL: `https://rula-tcoc-calculator.vercel.app`
- Redirect URLs: add `https://rula-tcoc-calculator.vercel.app/**` and `http://localhost:3000/**`

**Authentication → Sign In / Providers → Email**: leave Email enabled.

> Supabase's built-in email sender is limited to a few emails per hour and is
> meant for testing. Before the whole team uses it, add your own SMTP provider
> under **Authentication → Emails → SMTP Settings** (e.g. Resend, Postmark, or
> SendGrid).

## 4. Connect the app
From **Project Settings → API** copy the **Project URL** and the **anon / public** key, then:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

For local development, put the same values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

The anon key is safe to expose in the browser: access is enforced by the
row-level security policies in the SQL file (signed-in `@rula.com` users only).
Never put the `service_role` key in the app.
