# OTCR Contact Database

Next.js app for OTCR contact search, filtering, and admin-managed CRUD backed by Supabase.

## Local development

1. Install dependencies:

```bash
npm ci
```

2. Add required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Start development server:

```bash
npm run dev
```

## GitHub Pages deployment (org repo + custom subdomain)

This project is configured for static export (`output: "export"`) and deploys through GitHub Actions.

### 1. Required repository settings

1. Go to GitHub repository Settings -> Pages.
2. Set Source to GitHub Actions.

### 2. Required repository secrets

Add these in Settings -> Secrets and variables -> Actions:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `NEXT_PUBLIC_SITE_URL` (your final `https://subdomain.your-org-domain.com`)
4. `NEXT_PUBLIC_BASE_PATH` (optional; workflow auto-derives if omitted)

### 3. Workflow

Deployment workflow is in `.github/workflows/deploy-pages.yml`.

It automatically runs on pushes to `main`, builds static files into `out/`, and deploys to GitHub Pages.

For a project repo URL like `https://username.github.io/repo-name`, set `NEXT_PUBLIC_BASE_PATH=/repo-name` or rely on automatic derivation.
For a custom domain root like `https://contacts.yourorg.com`, leave `NEXT_PUBLIC_BASE_PATH` empty.

Automatic derivation order:

1. Use `NEXT_PUBLIC_BASE_PATH` if provided.
2. Else derive from the path in `NEXT_PUBLIC_SITE_URL`.
3. Else fallback to `/<repo-name>` for GitHub project Pages repositories.

The workflow also adds `.nojekyll` to the exported site so GitHub Pages serves the `_next` directory correctly.

### 4. Custom subdomain setup

1. In GitHub repository Settings -> Pages, set your Custom domain.
2. In your DNS provider, create a `CNAME` record from your subdomain to `<org>.github.io`.
3. Wait for DNS propagation, then enable Enforce HTTPS in Pages settings.

### 5. Supabase auth redirect URL

In Supabase Auth provider settings, add your callback URL:

```text
https://subdomain.your-org-domain.com/auth/callback/
```

Note: trailing slash is expected because this app exports static routes with trailing slashes.

### 6. Required Supabase RLS policies

To keep authorization behavior identical after moving to static hosting, run:

1. [supabase/rls-policies.sql](supabase/rls-policies.sql)

This enforces:

1. Only allowlisted users can read contacts.
2. Only admins can create, update, or delete contacts.
3. Users can only read their own row in `allowed_users`.
