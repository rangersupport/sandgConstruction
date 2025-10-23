# Deployment Guide for Netlify

## Prerequisites
1. GitHub account with your code pushed
2. Netlify account (free tier works)
3. Supabase project set up
4. Mapbox account (free tier: 50k map loads/month)

## Step 1: Get Your API Keys

### Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key

### Mapbox (Important: Secure Your Token)
1. Sign up at https://www.mapbox.com
2. Go to Account > Access Tokens
3. Create a new token or copy the default public token
4. **IMPORTANT - Secure your token:**
   - Click on the token to edit it
   - Under "Token restrictions" > "URL restrictions"
   - Add your Netlify domain (e.g., `https://your-app.netlify.app/*`)
   - Add localhost for development: `http://localhost:3000/*`
   - This prevents unauthorized use of your token
5. Free tier includes 50,000 map loads per month

**Note:** Mapbox public tokens are designed to be exposed on the client side. The URL restrictions protect against unauthorized use.

## Step 2: Deploy to Netlify

### Option A: Deploy from GitHub (Recommended)
1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `NEXT_PUBLIC_MAPBOX_TOKEN` = your Mapbox token
6. Click "Deploy site"

### Option B: Netlify CLI
\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
\`\`\`

## Step 3: Set Up Database

After deployment, run the SQL scripts in your Supabase SQL Editor:
1. `001_create_database_functions.sql`
2. `002_setup_rls_policies.sql`
3. `003_seed_sample_data.sql`
4. `004_add_gps_and_payroll_fields.sql`

## Step 4: Test Your Deployment

Visit your Netlify URL and test:
- Dashboard loads with data
- Employee clock in/out works
- Map shows project locations with worker counts
- Payroll calculations work
- GPS verification functions

## Automatic Deployments

Once connected to GitHub, Netlify will automatically:
- Deploy when you push to main branch
- Create preview deployments for pull requests
- Run build checks before deploying

## Troubleshooting

### Environment Variables Not Working
- Make sure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables

### Map Not Loading
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- Check Mapbox token has proper scopes enabled

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check RLS policies are set up correctly
- Ensure database tables exist

## Cost Estimate (Free Tier)
- Netlify: Free (100GB bandwidth, 300 build minutes/month)
- Supabase: Free (500MB database, 2GB bandwidth)
- Mapbox: Free (50k map loads/month)

Total: $0/month for small teams (5-20 employees)

## Scaling
When you outgrow free tiers:
- Netlify Pro: $19/month (1TB bandwidth)
- Supabase Pro: $25/month (8GB database)
- Mapbox: Pay as you go ($5 per 1000 loads after free tier)

## Security Best Practices

### Mapbox Token Security
- ✅ Public tokens (NEXT_PUBLIC_MAPBOX_TOKEN) are safe to expose - they're designed for client-side use
- ✅ Always add URL restrictions to your token in the Mapbox dashboard
- ✅ Monitor usage in Mapbox dashboard to detect unusual activity
- ✅ Rotate tokens if you suspect unauthorized use

### Supabase Security
- ✅ Anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is safe to expose - protected by RLS policies
- ❌ Never expose SUPABASE_SERVICE_ROLE_KEY on the client
- ✅ Always use Row Level Security (RLS) policies on all tables
- ✅ Test RLS policies thoroughly before going to production
