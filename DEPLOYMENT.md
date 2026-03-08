# Deployment & Setup Guide

This guide covers deploying and configuring Main-Control-Board for production and development environments.

---

## Prerequisites

### System Requirements
- **Node.js** 18.17+
- **npm** or **yarn**
- **Git**
- **GitHub account** (for code hosting)
- **Vercel account** (for deployment)
- **Supabase account** (for PostgreSQL database)
- **Firebase account** (for Realtime Database)

### Accounts & Services
1. **GitHub** - Source control and CI/CD
2. **Vercel** - Production hosting
3. **Supabase** - PostgreSQL database
4. **Firebase** - Realtime database and auth
5. **NextAuth.js** - OAuth provider setup (GitHub or Google)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/Warr10rOfOdin/Main-control-board.git
cd Main-control-board
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create `.env.local` file in project root:

```env
# ════════════════════════════════════════════════════════════════
# SUPABASE (PostgreSQL Database)
# ════════════════════════════════════════════════════════════════
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ════════════════════════════════════════════════════════════════
# FIREBASE (Realtime Database)
# ════════════════════════════════════════════════════════════════
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# ════════════════════════════════════════════════════════════════
# NEXTAUTH.JS (Authentication)
# ════════════════════════════════════════════════════════════════
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here_min_32_chars

# GitHub OAuth (register at https://github.com/settings/developers)
GITHUB_ID=your_github_app_id
GITHUB_SECRET=your_github_app_secret

# Google OAuth (optional, register at Google Cloud Console)
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# ════════════════════════════════════════════════════════════════
# SENTRY (Error Tracking)
# ════════════════════════════════════════════════════════════════
NEXT_PUBLIC_SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# ════════════════════════════════════════════════════════════════
# APPLICATION
# ════════════════════════════════════════════════════════════════
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting Credentials:**

#### Supabase
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Project Settings → API → URLs and Keys
4. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `SUPABASE_SERVICE_ROLE_KEY` from same page

#### Firebase
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Realtime Database (Start in test mode for dev)
4. Go to Project Settings → General → Copy config
5. Create a Service Account key (Project Settings → Service Accounts)

#### NextAuth
1. For GitHub: Go to Settings → Developer settings → OAuth Apps
2. Create new OAuth App, set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Client Secret

### 4. Database Setup

#### Supabase Migrations

```bash
# Option 1: Using Supabase CLI
npx supabase link --project-ref xxx
npx supabase db push

# Option 2: Manual - copy-paste SQL from migrations
# Go to supabase.co → SQL Editor → run each file in order:
# 1. supabase/migrations/001_billing_schema.sql
# 2. supabase/migrations/002_seed_data.sql
# 3. supabase/migrations/003_subscriptions_costs_settings.sql
# 4. supabase/migrations/004_rls_policies.sql
# 5. supabase/migrations/005_seed_new_tables.sql
```

#### Firebase Realtime DB Rules

Set Firebase Realtime Database rules (Database → Rules tab):

```json
{
  "rules": {
    "tenantRegistry": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": true,
        ".write": true
      }
    },
    "tenants": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": true,
        ".write": true
      }
    },
    "domainMap": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Access http://localhost:3000

You should see the login page. Log in using GitHub OAuth.

### 6. Seed Data (Optional)

To populate with demo data for testing:

```bash
# Already included in migrations, but to manually add:
npm run seed
```

---

## Production Deployment

### 1. Prepare Code

```bash
# Ensure all changes are committed
git add .
git commit -m "Deploy to production"
git push origin main
```

### 2. Create Vercel Project

#### Option A: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select Main-control-board repository
4. Import project

#### Option B: Deploy via CLI
```bash
npm install -g vercel
vercel link
vercel
```

### 3. Set Environment Variables in Vercel

1. Go to Vercel Project Settings → Environment Variables
2. Add all env vars from `.env.local`
3. Make sure `NEXT_PUBLIC_*` vars are set (accessible in browser)
4. Make sure sensitive vars are NOT marked as public

**Important Settings:**
- Add vars for **Production** environment
- Add vars for **Preview** environment (optional)
- Add vars for **Development** environment (optional)

### 4. Configure Production URLs

Update environment variables for production domain:

```env
# In Vercel Production Environment
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# For GitHub OAuth, update callback URL in GitHub App settings:
# https://your-domain.vercel.app/api/auth/callback/github
```

### 5. Set Up Custom Domain (Optional)

1. In Vercel Project → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `control-board.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL

### 6. Deploy

```bash
# Deploy latest main branch to production
vercel --prod

# Or Vercel will auto-deploy on git push to main
```

### 7. Post-Deployment Verification

- [ ] Vercel build succeeded (check Deployments)
- [ ] Application loads without errors (check browser console)
- [ ] Can log in with OAuth (GitHub/Google)
- [ ] Dashboard shows data
- [ ] Can create new apps
- [ ] API endpoints respond

---

## Database Configuration

### Supabase Production Setup

#### Security
1. **Row Level Security (RLS)** - Already configured in migrations
2. **JWT Verification** - NextAuth signs tokens securely
3. **API Key** - Use anon key in browser, service role key server-side only

#### Backups
1. Go to Supabase Dashboard → Backups
2. Enable automated backups
3. Set retention policy (default: 7 days)
4. Manual backups can be triggered anytime

#### Monitoring
1. Go to Supabase Dashboard → Usage → Database
2. Monitor connection count, storage, API calls
3. Set up alerts for approaching limits

### Firebase Production Setup

#### Security
1. **Authentication** - Use Firebase Auth or NextAuth
2. **Firestore Rules** - Set permissions in Firebase Console
3. **Realtime DB Rules** - Already configured above

#### Scaling
1. Firebase automatically scales
2. Monitor usage in Firebase Console → Usage → Realtime Database
3. For high volume, consider Firestore instead

---

## Monitoring & Maintenance

### Sentry Error Tracking

1. Go to https://sentry.io
2. Create new project (Node.js)
3. Add auth token and project ID to env vars
4. Errors automatically tracked and reported

**View errors:**
- Go to Sentry Dashboard → Issues
- Filter by release/environment
- Click issue for full stack trace

### Health Checks

Monitor production health:

```bash
# Check status page
curl https://your-domain.vercel.app/api/health

# Monitor logs (Vercel Function Logs)
vercel logs your-project
```

### Database Maintenance

```bash
# Analyze query performance
SELECT query, mean_time, calls FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

# Vacuum and analyze (maintenance)
VACUUM ANALYZE;
```

---

## Scaling Considerations

### Increase Database Capacity

**Supabase:**
1. Go to Project Settings → Billing
2. Upgrade plan (Pro, Business)
3. Limits increase automatically

**Firebase:**
- Pay-as-you-go pricing
- No manual scaling needed
- Handles auto-scaling

### CDN & Caching

Vercel provides:
- Global CDN (automatic)
- ISR (Incremental Static Regeneration)
- Edge Functions for low-latency responses

### Performance Optimization

1. **Database Indexes** - Already created in migrations
2. **API Rate Limiting** - Configured at application level
3. **Caching** - Next.js automatically caches static pages

---

## Troubleshooting

### Build Errors

**Error: "SUPABASE_URL not found"**
- Solution: Add all env vars to Vercel (check both `.env.local` and Vercel dashboard)

**Error: "Firebase config missing"**
- Solution: Verify NEXT_PUBLIC_FIREBASE_* vars are set and correct

### Runtime Errors

**Error: "Failed to authenticate with Supabase"**
- Check Supabase credentials in .env
- Verify anon key is public, service role is private
- Check RLS policies allow current user

**Error: "Firebase Realtime Database connection timeout"**
- Check Firebase project is active
- Verify database URL is correct
- Check Firebase rules allow read/write

### Deployment Issues

**Build fails on Vercel:**
```bash
# Check build logs
vercel logs your-project --follow

# Test build locally
npm run build

# Common fixes:
# - Add missing env vars
# - Clear Vercel cache (Settings → Advanced → Deployments → Clear Cache)
```

### Performance Issues

**Slow database queries:**
```sql
-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements
WHERE mean_time > 1000 ORDER BY mean_time DESC;

-- Create indexes for frequently filtered columns
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_customers_active ON customers(is_active);
```

---

## Development Workflow

### Local Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# 3. Test locally
npm run dev

# 4. Run tests
npm run test

# 5. Commit changes
git add .
git commit -m "feat: add my feature"

# 6. Push to GitHub
git push origin feature/my-feature

# 7. Create pull request on GitHub
# 8. Vercel creates preview deployment automatically
# 9. Merge PR to deploy to production
```

### Database Migrations

```bash
# Generate new migration
supabase migration new add_new_table

# Edit migration file: supabase/migrations/20260223xxx_add_new_table.sql

# Test locally
supabase db reset

# Deploy to production
supabase db push
```

### Environment-Specific Deployment

```bash
# Deploy to staging (optional)
git push origin staging

# Deploy to production
git push origin main

# Or manual trigger:
vercel --prod
```

---

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] API keys rotated regularly
- [ ] HTTPS enabled on all domains
- [ ] RLS policies configured in Supabase
- [ ] Firebase Realtime DB rules restricted
- [ ] Sentry errors monitored
- [ ] Rate limiting enabled
- [ ] Webhooks use HTTPS only
- [ ] OAuth redirect URLs configured correctly
- [ ] Database backups enabled
- [ ] Access logs monitored

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js Docs**: https://next-auth.js.org

---

**See Also**: [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, [API_INTEGRATION.md](./API_INTEGRATION.md) for app integration
