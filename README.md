# QYRON STUDIO

Next.js 14 · TypeScript · Tailwind · GSAP + ScrollTrigger · Framer Motion · Supabase (Postgres + Storage)

## 1. Supabase (about 5 minutes)
1. supabase.com > New project (any name, pick a region near you, save the database password).
2. When it is ready: **SQL Editor > New query**, paste everything from `supabase/setup.sql`, tap **Run**.
   This creates the `projects` and `messages` tables (locked: no public access) and a public image bucket called `projects`.
3. **Project Settings > API** (or API Keys). Copy:
   - Project URL
   - `anon` / publishable key
   - `service_role` / secret key (keep private)

## 2. Environment variables
Copy `.env.local.example` to `.env.local` for local use, and add the same five values in Vercel under
**Settings > Environment Variables** (Production, Preview, Development):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`.

## 3. Run or deploy
    npm install && npm run dev          # http://localhost:3000, admin at /admin
Deploy: push to GitHub, import the repo in Vercel, add the variables, deploy (redeploy after adding variables).

## Security model
- Your password and the service_role key exist only as server environment variables. They are never sent to the browser.
- Login compares hashes on the server and sets a signed, HttpOnly, SameSite=Strict cookie (7 days). Attempts are rate-limited and slowed.
- The tables have Row Level Security on and no public policies, so the public cannot read drafts or messages even with the anon key.
- Uploads: the browser asks the server for a one-time signed upload token (admin only); the bucket accepts images up to 10 MB.
- The public site only receives published projects, from `/api/projects`.
- To log everyone out, change `SESSION_SECRET` and redeploy. To change the password, edit `ADMIN_PASSWORD` and redeploy.

## Notes
- Supabase free projects pause after about a week of no activity. Open the Supabase dashboard and press Restore if that happens.
- Socials, contact email, services and process steps: `src/lib/data.ts`.
