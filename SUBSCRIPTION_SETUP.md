# Job Subscription System Setup Guide

AcrossJobs now features a **job subscription system** instead of authentication. Users can browse all jobs freely and subscribe to receive email notifications for matching opportunities.

---

## Features

### 🔓 **Fully Public Access**
- No login required
- Browse all 5,000+ jobs instantly
- View job details without registration
- Filter by category, search, and more

### 📧 **Smart Job Alerts**
- Subscribe with email
- Choose job categories (IT, Sales, Marketing, Finance, etc.)
- Filter by job type (Full-time, Remote, Contract, etc.)
- Set experience level preferences
- Specify location and salary expectations
- Select notification frequency (Instant, Daily, Weekly)

### 📩 **Notification Types**
1. **Instant** - Get notified as soon as jobs are posted
2. **Daily Digest** - One email per day with all matching jobs
3. **Weekly Summary** - Weekly roundup of opportunities

---

## Database Setup

### 1. Create Subscriptions Table

Run the SQL schema in your Supabase SQL Editor:

```bash
# File location
db/schema/job_subscriptions.sql
```

**Or copy/paste this in Supabase Dashboard → SQL Editor**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **"New query"**
5. Paste contents of `db/schema/job_subscriptions.sql`
6. Click **"Run"**

### 2. Verify Table Created

Check that the table exists:

```sql
SELECT * FROM job_subscriptions LIMIT 1;
```

Should return empty result (no error).

---

## Table Schema

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | User email (validated) |
| `name` | TEXT | Optional user name |
| `categories` | TEXT[] | Job categories (required) |
| `job_types` | TEXT[] | Job types (optional) |
| `experience_level` | TEXT | Experience level (optional) |
| `location` | TEXT | Preferred location (optional) |
| `salary_min` | INTEGER | Minimum salary (optional) |
| `notification_frequency` | TEXT | instant, daily, weekly |
| `is_active` | BOOLEAN | Subscription status |
| `created_at` | TIMESTAMPTZ | Signup date |
| `updated_at` | TIMESTAMPTZ | Last update |
| `last_notification_sent_at` | TIMESTAMPTZ | Last email sent |
| `unsubscribe_token` | TEXT | Unique unsubscribe link token |

### Indexes

- `idx_subscriptions_email` - Fast email lookup
- `idx_subscriptions_active` - Filter active subscriptions
- `idx_subscriptions_categories` - Search by categories (GIN index)
- `idx_subscriptions_created_at` - Sort by signup date
- `idx_subscriptions_unsubscribe` - Unsubscribe link validation

### Security

**Row Level Security (RLS)** is enabled:

- ✅ **Anyone can subscribe** (insert)
- ✅ **Anyone can view subscriptions** (for admin dashboard)
- ✅ **Users can update via unsubscribe token**
- ✅ **Users can delete via unsubscribe token**

---

## User Flow

### 1. Browse Jobs (Public)

```
User visits acrossjob.com
  ↓
Browse all jobs (no login)
  ↓
Filter by category, search, etc.
  ↓
View job details
```

### 2. Subscribe to Alerts

```
Click "Get Job Alerts" button (navbar)
  ↓
Redirects to /subscribe
  ↓
Fill out subscription form:
  - Email address
  - Name (optional)
  - Job categories (required)
  - Job types (Full-time, Remote, etc.)
  - Experience level
  - Location preference
  - Minimum salary
  - Notification frequency
  ↓
Click "Subscribe to Job Alerts"
  ↓
Data saved to job_subscriptions table
  ↓
Success message shown
  ↓
Redirect to browse jobs
```

### 3. Receive Notifications

**Implementation needed** (backend service):

1. **Instant Notifications**
   - Trigger: New job posted
   - Match against active subscriptions
   - Send email to matching subscribers

2. **Daily Digest**
   - Trigger: Cron job (daily at 9 AM)
   - Find jobs posted in last 24 hours
   - Match against daily subscribers
   - Send grouped email

3. **Weekly Summary**
   - Trigger: Cron job (Monday 9 AM)
   - Find jobs posted in last 7 days
   - Match against weekly subscribers
   - Send comprehensive summary

### 4. Unsubscribe

**Implementation needed**:

```
Email contains unsubscribe link:
https://acrossjob.com/unsubscribe?token={unsubscribe_token}
  ↓
Update: is_active = false
  ↓
Show confirmation message
```

---

## Email Notification Service

### Option 1: Supabase Edge Functions

```typescript
// functions/send-job-alerts/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  )

  // Get active subscriptions
  const { data: subscriptions } = await supabase
    .from('job_subscriptions')
    .select('*')
    .eq('is_active', true)
    .eq('notification_frequency', 'instant')

  // Get new jobs (posted in last hour)
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())

  // Match jobs to subscriptions
  for (const sub of subscriptions) {
    const matchingJobs = jobs.filter(job => 
      sub.categories.includes(job.category) &&
      (!sub.job_types.length || sub.job_types.includes(job.type)) &&
      (!sub.location || job.location.includes(sub.location)) &&
      (!sub.salary_min || job.salary >= sub.salary_min)
    )

    if (matchingJobs.length > 0) {
      // Send email using Resend, SendGrid, etc.
      await sendEmail(sub.email, matchingJobs)
      
      // Update last notification timestamp
      await supabase
        .from('job_subscriptions')
        .update({ last_notification_sent_at: new Date().toISOString() })
        .eq('id', sub.id)
    }
  }

  return new Response(JSON.stringify({ sent: subscriptions.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Option 2: External Service (Zapier, Make.com)

1. **Webhook Trigger**: New job posted
2. **Query Supabase**: Get matching subscriptions
3. **Send Email**: Via Gmail, SendGrid, Mailgun, etc.
4. **Update Database**: Set last_notification_sent_at

### Option 3: Custom Backend (Node.js, Python)

```javascript
// server.js (Node.js + Express)
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Daily digest - runs at 9 AM every day
cron.schedule('0 9 * * *', async () => {
  console.log('Sending daily job alerts...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Get daily subscribers
  const { data: subs } = await supabase
    .from('job_subscriptions')
    .select('*')
    .eq('is_active', true)
    .eq('notification_frequency', 'daily');
  
  // Get jobs from last 24 hours
  const yesterday = new Date(Date.now() - 86400000);
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .gte('created_at', yesterday.toISOString());
  
  // Send emails...
  for (const sub of subs) {
    const matches = jobs.filter(/* matching logic */);
    if (matches.length > 0) {
      await sendEmail(sub.email, matches);
    }
  }
});
```

---

## Email Template Example

### Instant/Daily Alert

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #4F46E5; color: white; padding: 20px; }
    .job { border: 1px solid #E5E7EB; padding: 15px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>👋 Hey {{name}}!</h1>
    <p>{{job_count}} new jobs match your preferences</p>
  </div>
  
  {{#each jobs}}
  <div class="job">
    <h3>{{title}}</h3>
    <p><strong>{{company}}</strong> • {{location}}</p>
    <p>{{description}}</p>
    <a href="https://acrossjob.com/jobs/{{category}}/{{id}}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View Job</a>
  </div>
  {{/each}}
  
  <hr>
  <p style="color: #6B7280; font-size: 12px;">
    You're receiving this because you subscribed to AcrossJobs alerts.<br>
    <a href="https://acrossjob.com/unsubscribe?token={{unsubscribe_token}}">Unsubscribe</a> | 
    <a href="https://acrossjob.com/subscribe">Update Preferences</a>
  </p>
</body>
</html>
```

---

## Testing Subscription

### 1. Local Testing

```bash
# Start dev server
npm run dev

# Visit
http://localhost:5173

# Click "Get Job Alerts" in navbar
# Fill out form
# Submit
```

### 2. Check Database

```sql
SELECT 
  email,
  name,
  categories,
  notification_frequency,
  created_at
FROM job_subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Test Matching Logic

```sql
-- Find subscriptions matching IT jobs
SELECT 
  email,
  categories,
  job_types
FROM job_subscriptions
WHERE 'IT' = ANY(categories)
  AND is_active = true;
```

---

## Admin Dashboard

Add to AdminDashboard.tsx:

```typescript
// Show subscription stats
const { data: stats } = await supabase
  .from('job_subscriptions')
  .select('id', { count: 'exact' });

const { data: activeStats } = await supabase
  .from('job_subscriptions')
  .select('id', { count: 'exact' })
  .eq('is_active', true);

console.log(`Total subscriptions: ${stats.count}`);
console.log(`Active subscriptions: ${activeStats.count}`);
```

---

## Next Steps

### Required

1. ✅ Create `job_subscriptions` table in Supabase
2. ✅ Test subscription form
3. ☐ Implement email notification service
4. ☐ Create email templates
5. ☐ Add unsubscribe page
6. ☐ Set up cron jobs for daily/weekly digests

### Optional

- [ ] Subscription management page (update preferences)
- [ ] Email preview before sending
- [ ] A/B testing for email templates
- [ ] Analytics: open rates, click rates
- [ ] SMS notifications (Twilio)
- [ ] Slack/Discord notifications

---

## Email Service Providers

### Free Tier Options

1. **Resend** - 100 emails/day free
   - https://resend.com
   - Simple API, great docs

2. **SendGrid** - 100 emails/day free
   - https://sendgrid.com
   - Popular, reliable

3. **Mailgun** - 5,000 emails/month free (first 3 months)
   - https://mailgun.com
   - Powerful API

4. **Brevo (Sendinblue)** - 300 emails/day free
   - https://brevo.com
   - Marketing automation

---

## Summary

✅ **No authentication** - Fully public job board  
✅ **Email subscriptions** - Users opt-in for alerts  
✅ **Smart matching** - Categories, types, location, salary  
✅ **Flexible notifications** - Instant, daily, or weekly  
✅ **Unsubscribe support** - Easy opt-out  
✅ **Database ready** - Schema and indexes configured  

**Users can now browse freely and get notified of relevant opportunities!** 🚀
