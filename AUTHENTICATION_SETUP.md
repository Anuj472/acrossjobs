# AcrossJobs Authentication Setup Guide

This guide will help you configure authentication for AcrossJobs. The platform supports:

1. **Google OAuth** - Social login
2. **Email/Password** - Traditional authentication with magic link password reset

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Supabase Configuration](#supabase-configuration)
- [Google OAuth Setup](#google-oauth-setup)
- [Email/Password Setup](#emailpassword-setup)
- [Testing Authentication](#testing-authentication)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Supabase account ([signup here](https://supabase.com))
- Google Cloud account ([signup here](https://cloud.google.com))
- Your AcrossJobs deployment URL (e.g., `https://acrossjob.com`)

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: AcrossJobs
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes 2-3 minutes)

### 2. Configure Site URL

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `https://acrossjob.com` (your production URL)
   - **Redirect URLs**: Add these:
     ```
     https://acrossjob.com
     https://acrossjob.com/auth/callback
     https://acrossjob.com/auth/reset-password
     http://localhost:5173
     http://localhost:5173/auth/callback
     http://localhost:5173/auth/reset-password
     ```
3. Click **"Save"**

### 3. Enable Authentication Providers

1. Go to **Authentication** → **Providers**
2. Enable:
   - ✅ **Email** (enabled by default)
   - ✅ **Google** (requires setup below)

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. If prompted, configure the consent screen:
   - **User Type**: External
   - **App name**: AcrossJobs
   - **User support email**: your@email.com
   - **Developer contact**: your@email.com
   - Click **"Save and Continue"**
6. Click **"+ ADD OR REMOVE SCOPES"**:
   - Add `email`
   - Add `profile`
   - Add `openid`
   - Click **"Update"** → **"Save and Continue"**
7. Add test users (optional for testing)
8. Click **"Back to Dashboard"**

### Step 2: Create OAuth Client ID

1. Go back to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Fill in:
   - **Name**: AcrossJobs Production
   - **Authorized JavaScript origins**: Add:
     ```
     https://acrossjob.com
     http://localhost:5173
     ```
   - **Authorized redirect URIs**: Add:
     ```
     https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/callback
     ```
     
     *Replace `<YOUR_SUPABASE_PROJECT>` with your Supabase project reference ID*
     
     *Example: `https://abcdefghij.supabase.co/auth/v1/callback`*

5. Click **"Create"**
6. **Copy** the **Client ID** and **Client Secret** (you'll need these next)

### Step 3: Configure Google in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** provider
3. Toggle **"Enabled"** to ON
4. Paste:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Click **"Save"**

### Step 4: Publish OAuth Consent Screen (Production)

**For production use only:**

1. Go to Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. Click **"PUBLISH APP"**
3. Confirm publishing
4. Your app is now available for all Google users

**Note**: While in testing mode, only added test users can sign in.

---

## Email/Password Setup

### Email Authentication is **Already Enabled** in Supabase!

No additional configuration needed. The following features work out of the box:

### Features:

1. **Sign Up** - Users create accounts with email/password
2. **Sign In** - Users log in with credentials
3. **Email Confirmation** - Optional email verification (configured in Supabase)
4. **Password Reset** - Magic link sent to email
5. **Password Requirements** - Minimum 6 characters

### Configure Email Templates (Optional)

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize templates:
   - **Confirm signup** - Email verification
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset link

### Email Confirmation Settings

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers** → **Email**:
   - **Enable email confirmations**: Toggle ON/OFF
     - **ON**: Users must verify email before login
     - **OFF**: Users can log in immediately
3. Set **Mailer** settings:
   - **Sender email**: Default is `noreply@mail.app.supabase.io`
   - For custom domain: Configure SMTP (Pro plan)

### Password Reset Flow

**How it works:**

1. User clicks **"Forgot Password?"** on sign-in page
2. Enters email address
3. Receives magic link via email
4. Clicks link → Redirects to `/auth/reset-password`
5. Sets new password
6. Redirects to sign-in page

**Magic Link Validity**: 1 hour (default)

---

## Testing Authentication

### Local Testing

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: `http://localhost:5173`

3. **Test Google Login**:
   - Click **"Continue with Google"**
   - Should redirect to Google login
   - After authentication, returns to `/auth/callback`
   - Auto-redirects to `/jobs`

4. **Test Email Sign Up**:
   - Click **"Sign Up"** tab
   - Enter email and password (min 6 chars)
   - Confirm password
   - Click **"Create Account"**
   - If email confirmation enabled: Check inbox
   - If disabled: Auto-login and redirect to `/jobs`

5. **Test Email Sign In**:
   - Click **"Sign In"** tab
   - Enter email and password
   - Click **"Sign In"**
   - Should redirect to `/jobs`

6. **Test Password Reset**:
   - Click **"Forgot Password?"**
   - Enter email
   - Click **"Send Reset Link"**
   - Check inbox for magic link
   - Click link → Opens `/auth/reset-password`
   - Enter new password (twice)
   - Click **"Reset Password"**
   - Redirects to sign-in

### Production Testing

1. **Deploy to Cloudflare Pages**
2. **Visit your site**: `https://acrossjob.com`
3. **Test all auth flows** (same as local)
4. **Verify email delivery** in production

---

## Troubleshooting

### Google OAuth Issues

**Problem**: "Error 400: redirect_uri_mismatch"

**Solution**:
- Check that redirect URI in Google Cloud Console matches **exactly**:
  ```
  https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/callback
  ```
- No trailing slashes
- Use exact Supabase project reference ID

**Problem**: "Access blocked: This app's request is invalid"

**Solution**:
- Verify OAuth consent screen is configured
- Add scopes: `email`, `profile`, `openid`
- Add test users if in testing mode

**Problem**: "This app isn't verified"

**Solution**:
- While in testing: Only test users can sign in
- For all users: Publish OAuth consent screen
- Or click "Advanced" → "Go to AcrossJobs (unsafe)" during testing

### Email/Password Issues

**Problem**: "Email not confirmed"

**Solution**:
- Check email inbox (including spam)
- Or disable email confirmation in Supabase
- Go to **Authentication** → **Providers** → **Email** → Toggle off **"Enable email confirmations"**

**Problem**: "Invalid login credentials"

**Solution**:
- Verify email/password are correct
- Check if email confirmation is required
- Try password reset flow

**Problem**: "Password reset link not working"

**Solution**:
- Check that redirect URL is added in Supabase:
  ```
  https://acrossjob.com/auth/reset-password
  ```
- Verify link hasn't expired (1 hour validity)
- Request new reset link

**Problem**: "Emails not being sent"

**Solution**:
- Check Supabase email rate limits (free tier: 4 emails/hour)
- Verify email templates are enabled
- For custom domain: Configure SMTP (requires Pro plan)
- Check spam folder

### General Issues

**Problem**: Stuck on loading screen after login

**Solution**:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors
- Verify Supabase API keys in `.env.local`

**Problem**: Session not persisting

**Solution**:
- Check browser cookies are enabled
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Clear browser storage and try again

---

## Environment Variables

### Required Variables

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these**:
1. Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Cloudflare Pages Variables

Add to Cloudflare Dashboard → **Workers & Pages** → **acrossjobs** → **Settings** → **Environment Variables**:

```
SUPABASE_URL = https://<YOUR_PROJECT>.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

---

## Security Checklist

- [ ] Strong database password set in Supabase
- [ ] OAuth redirect URLs are exact (no wildcards)
- [ ] Site URL configured correctly
- [ ] Environment variables secured (not in git)
- [ ] HTTPS enforced on production
- [ ] Email confirmation enabled (recommended)
- [ ] Rate limiting enabled in Supabase
- [ ] Google OAuth consent screen configured
- [ ] Test all authentication flows

---

## Next Steps

1. ✅ Configure Google OAuth (optional but recommended)
2. ✅ Set up email templates (optional)
3. ✅ Deploy to Cloudflare Pages
4. ✅ Test all authentication flows
5. ✅ Monitor Supabase Auth logs

---

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **GitHub Issues**: https://github.com/Anuj472/acrossjobs/issues

---

**Authentication is now configured! 🎉**

Users can:
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Sign in with Google
- ✅ Reset password via magic link
- ✅ Browse 5,000+ jobs after authentication
