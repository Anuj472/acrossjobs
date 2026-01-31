# Authentication Setup Guide

This guide will help you configure social login (Google, GitHub, LinkedIn) for AcrossJobs.

## ✅ What's Already Implemented

- ✅ Landing page with sign-up CTA
- ✅ Authentication page with social login buttons
- ✅ OAuth callback handling
- ✅ Protected routes (jobs require login)
- ✅ User session management
- ✅ Auto-redirect after login

## 🔧 Supabase OAuth Setup Required

You need to configure OAuth providers in your Supabase project.

### 1. Google OAuth

#### Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: **External**
   - App name: **AcrossJobs**
   - Support email: Your email
   - Scopes: `email`, `profile`
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: `https://<your-project-id>.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**

#### Step 2: Add to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Authentication** → **Providers**
3. Enable **Google**
4. Paste **Client ID** and **Client Secret**
5. Save

---

### 2. GitHub OAuth

#### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - Application name: **AcrossJobs**
   - Homepage URL: `https://acrossjob.com`
   - Authorization callback URL: `https://<your-project-id>.supabase.co/auth/v1/callback`
4. Register application
5. Copy **Client ID**
6. Generate **Client Secret** and copy it

#### Step 2: Add to Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **GitHub**
3. Paste **Client ID** and **Client Secret**
4. Save

---

### 3. LinkedIn OAuth (via Azure AD)

#### Step 1: Create Azure AD App

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: **AcrossJobs**
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: `https://<your-project-id>.supabase.co/auth/v1/callback`
5. Register
6. Copy **Application (client) ID**
7. Go to **Certificates & secrets** → **New client secret**
8. Copy the **secret value**

#### Step 2: Add to Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Azure (Microsoft)**
3. Paste **Client ID** and **Client Secret**
4. Azure Tenant URL: `https://login.microsoftonline.com/common`
5. Save

---

## 🌐 Site URL Configuration

### Supabase Settings

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `https://acrossjob.com` (or your domain)
   - **Redirect URLs**: Add these:
     ```
     https://acrossjob.com
     https://acrossjob.com/auth/callback
     http://localhost:5173
     http://localhost:5173/auth/callback
     ```

### Cloudflare Pages Environment Variables

1. Go to Cloudflare Dashboard → **Workers & Pages** → **acrossjobs**
2. Click **Settings** → **Environment Variables**
3. Ensure these are set:
   ```
   SUPABASE_URL=https://<your-project-id>.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## 🧪 Testing Authentication

### Local Testing

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:5173`
3. Click **"Get Started Free"** or **"Create Free Account"**
4. Try each social login button
5. After successful login, you should:
   - See browser redirect to OAuth provider
   - Return to `/auth/callback`
   - Auto-redirect to `/jobs` (Home page)
   - See job listings

### Production Testing

1. Deploy to Cloudflare Pages
2. Visit `https://acrossjob.com`
3. Test social logins
4. Check browser console for any errors

---

## 🐛 Troubleshooting

### "Invalid redirect URI" Error

**Cause**: OAuth app redirect URI doesn't match Supabase callback URL

**Fix**: 
- Ensure OAuth app redirect URI is exactly: `https://<your-project-id>.supabase.co/auth/v1/callback`
- No trailing slash
- Use your actual Supabase project ID

### "Access denied" Error

**Cause**: OAuth consent screen not configured or app not verified

**Fix**:
- For Google: Set OAuth consent screen to **External** and add test users
- For GitHub: Check application permissions
- For Azure: Ensure correct tenant URL

### User Redirected but Not Logged In

**Cause**: Session not persisting

**Fix**:
- Check Supabase **Site URL** matches your domain
- Ensure cookies are enabled
- Check browser console for CORS errors

### "Network Error" or CORS Issues

**Cause**: Supabase URL or keys misconfigured

**Fix**:
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Cloudflare env vars
- Check Supabase API settings
- Ensure Row Level Security (RLS) policies allow read access

---

## 📊 User Flow

```
1. User visits acrossjob.com
   ↓
2. Sees landing page with "Get Started Free" button
   ↓
3. Clicks button → Redirected to /auth
   ↓
4. Clicks "Continue with Google" (or GitHub/LinkedIn)
   ↓
5. Redirected to OAuth provider
   ↓
6. User authenticates with provider
   ↓
7. Provider redirects to /auth/callback
   ↓
8. Session established
   ↓
9. Auto-redirect to /jobs (Home page)
   ↓
10. User can browse all 5000+ jobs ✅
```

---

## 🔒 Security Notes

- Never commit OAuth secrets to Git
- Use environment variables for all sensitive data
- Enable Row Level Security (RLS) on Supabase tables
- Set up rate limiting on Cloudflare
- Monitor authentication logs in Supabase

---

## 📝 Additional Features to Add (Optional)

- [ ] Email/password authentication
- [ ] Password reset flow
- [ ] Email verification
- [ ] User profile page
- [ ] Save favorite jobs
- [ ] Job application tracking
- [ ] Email notifications for new jobs

---

## 🚀 Ready to Launch!

Once all OAuth providers are configured:

1. ✅ Users see landing page
2. ✅ Click sign up → Auth page
3. ✅ Choose social login
4. ✅ Authenticate
5. ✅ Access all jobs

**Your job board is now a gated platform with social authentication!** 🎉
