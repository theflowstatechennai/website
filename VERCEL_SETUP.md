# Vercel Deployment Setup

## Environment Variables

To fix the deployment error, you need to add all environment variables to your Vercel project.

### Steps:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (flowstate-website)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Environment Variables:

#### Razorpay (Payment Gateway)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Your Razorpay test/production key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay secret key

#### Email Configuration (Gmail)
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASSWORD` - Your Gmail app-specific password
- `EMAIL_FROM` - Email address to send from (usually same as EMAIL_USER)

#### Supabase (Database)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

#### App Configuration
- `NEXT_PUBLIC_APP_NAME` - App name (e.g., "FlowState")
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., "https://yourapp.vercel.app")

#### Admin Authentication
- `ADMIN_PASSWORD` - Password for admin access

### Important Notes:

1. **Environment Scope**: Set all variables for **Production**, **Preview**, and **Development** environments
2. **Sensitive Keys**: Make sure `RAZORPAY_KEY_SECRET`, `EMAIL_PASSWORD`, and `SUPABASE_SERVICE_ROLE_KEY` are marked as sensitive
3. **Public Variables**: Variables starting with `NEXT_PUBLIC_` are exposed to the browser
4. **Redeploy**: After adding variables, trigger a new deployment or use "Redeploy" button

### Quick Command (Alternative):

You can also use the Vercel CLI to add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... repeat for all variables
```

### Verification:

After adding all variables, redeploy the project:

```bash
vercel --prod
```

Or push a new commit to trigger automatic deployment.
