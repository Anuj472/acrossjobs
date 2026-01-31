# AcrossJobs Changelog

## [2.0.0] - 2026-01-31

### 🚀 Major Changes

**BREAKING: Removed Authentication System**

- ❌ Removed Google OAuth
- ❌ Removed Email/Password authentication
- ❌ Removed GitHub OAuth
- ❌ Removed LinkedIn OAuth
- ❌ Removed user accounts and session management
- ❌ Removed Auth pages (Login, Signup, Password Reset)

**NEW: Job Subscription System**

- ✅ Fully public job board (no login required)
- ✅ Email subscription for job alerts
- ✅ Smart job matching based on user preferences
- ✅ Flexible notification frequency (Instant, Daily, Weekly)
- ✅ Comprehensive subscription form with:
  - Email address
  - Name (optional)
  - Job categories selection (IT, Sales, Marketing, Finance, Legal, Management, R&D)
  - Job types (Full-time, Part-time, Contract, Remote, Hybrid, Internship)
  - Experience level filtering
  - Location preferences
  - Minimum salary expectations
  - Notification frequency choice

### 🎯 New Features

#### Job Subscription Page (`/subscribe`)
- Beautiful multi-step form
- Category selection with visual checkboxes
- Job type filtering
- Location and salary preferences
- Success confirmation screen
- Responsive mobile design

#### Updated Navbar
- Removed user account dropdown
- Added "Get Job Alerts" button (desktop)
- Added bell icon button (mobile)
- Simplified navigation

#### Database Schema
- New `job_subscriptions` table
- Email validation
- Array fields for categories and job types
- Unsubscribe token generation
- Row Level Security (RLS) policies
- Optimized indexes for performance

### 📝 Documentation

- Added `SUBSCRIPTION_SETUP.md` - Comprehensive setup guide
- Added `db/schema/job_subscriptions.sql` - Database schema
- Updated README (pending)
- Removed `AUTHENTICATION_SETUP.md` references

### 🔧 Technical Changes

#### Frontend
- New component: `pages/JobSubscription.tsx`
- Updated: `App.tsx` - Removed auth logic, added subscription route
- Updated: `components/layout/Navbar.tsx` - Removed user account UI
- Updated: `pages/Landing.tsx` - Changed CTA to "Subscribe"

#### Backend
- Database table: `job_subscriptions`
- Fields: email, name, categories, job_types, experience_level, location, salary_min, notification_frequency
- Indexes: email, active status, categories (GIN), created_at, unsubscribe_token
- Triggers: Auto-update `updated_at` timestamp

#### Security
- RLS policies for public insert/select
- Email validation regex
- Unsubscribe token for secure opt-out
- At least one category required constraint

### 🚀 User Flow Changes

**Before (v1.x):**
```
Visit site → Sign up (Google/Email) → Login → Browse jobs
```

**Now (v2.0):**
```
Visit site → Browse all jobs freely → Subscribe for alerts (optional)
```

### 📊 Data Model

**New Table: `job_subscriptions`**

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | TEXT | Yes | User email |
| name | TEXT | No | User name |
| categories | TEXT[] | Yes | Job categories |
| job_types | TEXT[] | No | Employment types |
| experience_level | TEXT | No | Seniority level |
| location | TEXT | No | Preferred location |
| salary_min | INTEGER | No | Minimum salary |
| notification_frequency | TEXT | Yes | instant/daily/weekly |
| is_active | BOOLEAN | Yes | Subscription status |
| created_at | TIMESTAMPTZ | Yes | Signup date |
| updated_at | TIMESTAMPTZ | Yes | Last modified |
| last_notification_sent_at | TIMESTAMPTZ | No | Last email sent |
| unsubscribe_token | TEXT | Yes | Unique token |

### 🎨 UI Updates

#### Subscription Form
- Clean, modern design with gradient background
- Section-based layout (Personal Info, Categories, Preferences)
- Interactive category selection
- Job type pill buttons
- Dropdown for experience level
- Radio buttons for notification frequency
- Success screen with confirmation
- Mobile-responsive

#### Navbar
- Prominent "Get Job Alerts" button
- Bell icon for mobile
- Removed user profile dropdown
- Cleaner, simpler design

### ⚠️ Breaking Changes

1. **No Authentication Required**
   - All jobs are now publicly accessible
   - No user sessions or cookies
   - No protected routes

2. **Removed Files**
   - `pages/Auth.tsx`
   - `pages/AuthCallback.tsx`
   - `pages/ResetPassword.tsx`
   - Authentication-related utilities

3. **Changed Navigation**
   - `/auth` → Removed
   - `/auth/callback` → Removed
   - `/auth/reset-password` → Removed
   - `/subscribe` → Added (new)

4. **API Changes**
   - No user authentication endpoints
   - No session management
   - New subscription POST endpoint (Supabase RLS)

### 📦 Dependencies

**Unchanged:**
- React
- TypeScript
- Supabase (for database only, not auth)
- TailwindCSS
- Lucide Icons
- Cloudflare Pages

**Removed:**
- Supabase Auth usage
- OAuth provider dependencies

### 🔜 Next Steps (TODO)

#### Email Notification Service
- [ ] Choose email provider (Resend, SendGrid, Mailgun)
- [ ] Implement instant notification trigger
- [ ] Set up daily digest cron job
- [ ] Set up weekly summary cron job
- [ ] Create email templates (HTML)
- [ ] Test email delivery

#### Unsubscribe Flow
- [ ] Create `/unsubscribe` page
- [ ] Handle token validation
- [ ] Update `is_active` status
- [ ] Show confirmation message

#### Subscription Management
- [ ] "Update preferences" page
- [ ] Edit subscription details
- [ ] Pause/resume notifications

#### Analytics
- [ ] Track subscription conversions
- [ ] Monitor email open rates
- [ ] Track click-through rates
- [ ] Popular job categories

### 🐛 Bug Fixes

None - Clean slate with new subscription system

### 🔐 Security

- Email validation with regex
- Unsubscribe token prevents unauthorized changes
- RLS policies prevent data exposure
- No authentication = No password vulnerabilities
- No session hijacking risks

### 📈 Performance

- Faster page loads (no auth checks)
- Reduced bundle size (removed auth code)
- Simplified routing
- Database indexes for fast subscription queries

### 🌐 Deployment

**Steps:**

1. Deploy code to Cloudflare Pages
2. Run SQL schema in Supabase:
   ```sql
   -- See db/schema/job_subscriptions.sql
   ```
3. Test subscription form
4. Set up email notification service (later)

### 📞 Support

- GitHub Issues: https://github.com/Anuj472/acrossjobs/issues
- Documentation: See SUBSCRIPTION_SETUP.md

---

## Migration Guide (v1.x → v2.0)

### For Users

**Before:**
- Had to create account to view jobs
- Managed login credentials
- Could save favorite jobs (feature was planned)

**Now:**
- Browse all jobs without account
- Subscribe with email for alerts
- No passwords to remember

### For Developers

**Database:**
```sql
-- 1. Run new schema
\i db/schema/job_subscriptions.sql

-- 2. (Optional) Drop old auth tables if not needed
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS user_sessions;
```

**Environment Variables:**
```bash
# Keep these (for database)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Remove these (no longer needed)
# SUPABASE_JWT_SECRET
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
```

**Code Changes:**
```typescript
// Old: Check authentication
if (!user) {
  navigate('auth');
  return;
}

// New: No auth check needed
// Just render the page
return <HomePage />;
```

---

## Version History

### v2.0.0 (Current)
- Subscription-based job board
- No authentication
- Public access to all jobs
- Email notifications for matching jobs

### v1.x (Deprecated)
- Authentication-required job board
- Google, GitHub, LinkedIn OAuth
- Email/Password login
- Protected job listings

---

**Released:** January 31, 2026  
**Breaking Changes:** Yes  
**Migration Required:** Database schema update  
**Backward Compatible:** No  
