# Subscription Form with Subcategories - Visual Guide

The job subscription form now includes **expandable subcategories** for precise job matching!

---

## 🎯 Features

✅ **7 Main Categories** - IT, Management, Finance, Sales, Marketing, Legal, R&D  
✅ **25 Subcategories** - Detailed specializations within each category  
✅ **94 Job Roles** - Comprehensive role coverage  
✅ **Expandable UI** - Click to show/hide subcategories  
✅ **Flexible Selection** - Choose entire category OR specific subcategories  
✅ **Smart Matching** - More precise email alerts  

---

## 📋 Form Layout

### **Section 1: Personal Information**
```
📧 Your Information

Email Address *
[you@example.com]

Full Name (Optional)
[John Doe]
```

### **Section 2: Job Categories & Specializations** ⭐ NEW!

```
💼 Job Categories & Specializations *
Select categories and optionally choose specific specializations

┌─────────────────────────────────────────────────┐
│ ☑ IT & Software            5 specializations ▼ │
├─────────────────────────────────────────────────┤
│   ☑ Software Development                        │
│      Frontend Developer (React, Vue, Angular),  │
│      Backend Developer (Node.js, Python...)     │
│                                                  │
│   ☐ Data & AI                                   │
│      Data Scientist, Data Analyst, ML Eng...    │
│                                                  │
│   ☐ Infrastructure & Cloud                      │
│      DevOps Engineer, Cloud Architect...        │
│                                                  │
│   ☐ Security                                    │
│      Cybersecurity Analyst, Ethical Hacker...   │
│                                                  │
│   ☐ Design & Product                            │
│      UI/UX Designer, Product Designer...        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ☐ Management               4 specializations ▶ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ☑ Sales                    4 specializations ▼ │
├─────────────────────────────────────────────────┤
│   ☑ Hunting (New Business)                      │
│      Sales Development Representative (SDR),    │
│      Business Development Representative...     │
│                                                  │
│   ☑ Technical Sales                             │
│      Sales Engineer / Pre-Sales Consultant,     │
│      Solutions Architect +1 more                │
│                                                  │
│   ☐ Farming (Existing Clients)                  │
│      Account Manager, Customer Success...       │
│                                                  │
│   ☐ Leadership & Strategy                       │
│      Sales Manager, Director of Sales...        │
└─────────────────────────────────────────────────┘

... (and 4 more categories)
```

### **Section 3: Job Type**
```
⏰ Job Type

[Full-time]  [Part-time]  [Contract]
[Remote]     [Hybrid]     [Internship]
```

### **Section 4: Experience Level**
```
💼 Experience Level

[Dropdown: Any Level ▼]
- Entry Level
- Mid Level
- Senior Level
- Lead/Manager
- Executive
```

### **Section 5: Location**
```
📍 Preferred Location

[e.g., Mumbai, Remote, Bangalore]
```

### **Section 6: Salary**
```
💰 Minimum Salary (Optional)

[50000]
Annual salary in your local currency
```

### **Section 7: Notification Frequency**
```
📧 How Often Should We Notify You?

○ Instant (as jobs are posted)
● Daily Digest
○ Weekly Summary
```

---

## 🎬 User Interactions

### **Scenario 1: Select Entire Category**

**User Action:** Click checkbox next to "IT & Software"  
**Result:**  
- ✅ IT & Software category selected
- 📂 Subcategories automatically expand
- 📧 Will receive ALL IT jobs (Software Dev, Data & AI, Cloud, Security, Design)

### **Scenario 2: Select Specific Subcategories**

**User Action:**  
1. Click checkbox next to "Sales"
2. Category expands showing 4 subcategories
3. Click "Hunting (New Business)" and "Technical Sales"

**Result:**  
- ✅ Sales category selected
- ✅ 2 subcategories selected: Hunting, Technical Sales
- 📧 Will receive ONLY SDR, BDR, AE, Sales Engineer roles
- ❌ Will NOT receive Account Manager, CSM, Sales Manager roles

### **Scenario 3: Mixed Selection**

**User Action:**  
- Select entire "IT & Software" category (all subcategories)
- Select "Management" → then only "Product" subcategory
- Select "Marketing" → then "Digital" and "Strategy" subcategories

**Result:**  
- ✅ All IT roles
- ✅ Only PM, APM, Product Owner roles
- ✅ Only Digital Marketing + Marketing Manager/PMM/Brand roles

---

## 📊 Data Storage Format

### **Database: job_subscriptions table**

```sql
INSERT INTO job_subscriptions (
  email,
  name,
  categories,
  subcategories,  -- NEW!
  job_types,
  experience_level,
  location,
  salary_min,
  notification_frequency
) VALUES (
  'john@example.com',
  'John Doe',
  ARRAY['it', 'sales'],                    -- Main categories
  ARRAY['it:Software Development',         -- Specific subcategories
        'it:Data & AI',
        'sales:Hunting (New Business)',
        'sales:Technical Sales'],
  ARRAY['Full-time', 'Remote'],
  'Mid Level',
  'San Francisco',
  100000,
  'daily'
);
```

---

## 🔍 Job Matching Logic

### **When New Job is Posted**

```typescript
function matchJobToSubscriptions(job: Job) {
  // Job details
  const jobCategory = 'sales';  // e.g., Sales job
  const jobSubcategory = 'Hunting (New Business)';
  const jobTitle = 'Sales Development Representative';
  
  // Find matching subscriptions
  const matches = subscriptions.filter(sub => {
    // 1. Category must match
    if (!sub.categories.includes(jobCategory)) {
      return false;
    }
    
    // 2. If user selected specific subcategories, check those
    if (sub.subcategories.length > 0) {
      const userSubcatsForCategory = sub.subcategories.filter(
        s => s.startsWith(`${jobCategory}:`)
      );
      
      if (userSubcatsForCategory.length > 0) {
        // User wants specific subcategories
        const wantsThisSubcat = userSubcatsForCategory.some(
          s => s === `${jobCategory}:${jobSubcategory}`
        );
        if (!wantsThisSubcat) return false;
      }
      // If no subcats for this category, user wants ALL
    }
    
    // 3. Check other filters (job type, location, salary, etc.)
    if (sub.job_types.length > 0 && !sub.job_types.includes(job.type)) {
      return false;
    }
    
    if (sub.location && !job.location.includes(sub.location)) {
      return false;
    }
    
    if (sub.salary_min && job.salary < sub.salary_min) {
      return false;
    }
    
    return true;
  });
  
  return matches;
}
```

---

## 📧 Email Templates

### **Example 1: Broad Subscription**

**User subscribed to:** Entire IT & Software category

**Email Subject:** 12 New IT & Software Jobs - Daily Digest

```
Hi John! 👋

Here are today's IT & Software jobs matching your preferences:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Software Development (5 jobs)

1. Senior React Developer @ Google
   Remote | $120k-150k | [Apply Now]

2. Full Stack Engineer @ Facebook  
   Hybrid | $130k-160k | [Apply Now]

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Data & AI (4 jobs)

1. Machine Learning Engineer @ Netflix
   Remote | $150k-180k | [Apply Now]

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Infrastructure & Cloud (3 jobs)

1. DevOps Engineer @ Amazon
   On-site | $110k-140k | [Apply Now]

...
```

### **Example 2: Specific Subcategories**

**User subscribed to:** Sales > Hunting + Technical Sales only

**Email Subject:** 5 New Sales Jobs (Hunting & Technical) - Daily Digest

```
Hi Sarah! 👋

Here are today's jobs matching your specializations:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Hunting (New Business) (3 jobs)

1. SDR - Enterprise Sales @ Salesforce
   Remote | $60k-80k + Commission | [Apply Now]

2. Business Development Representative @ HubSpot
   Hybrid | $55k-75k + Commission | [Apply Now]

3. Account Executive @ Stripe
   Remote | $100k-130k OTE | [Apply Now]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Technical Sales (2 jobs)

1. Sales Engineer @ MongoDB
   Remote | $120k-150k | [Apply Now]

2. Pre-Sales Solutions Consultant @ Snowflake
   Hybrid | $130k-160k | [Apply Now]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're NOT receiving:
❌ Account Manager roles (Farming)
❌ Sales Manager roles (Leadership)

Want more? [Update Preferences]
```

---

## 🎨 UI Components

### **Category Card - Collapsed**
```
┌──────────────────────────────────────────┐
│ ☐ Sales          4 specializations   ▶  │
└──────────────────────────────────────────┘
```

### **Category Card - Expanded**
```
┌──────────────────────────────────────────┐
│ ☑ Sales          4 specializations   ▼  │
├──────────────────────────────────────────┤
│                                           │
│  ☑ Hunting (New Business)                │
│     Sales Development Representative...   │
│                                           │
│  ☐ Farming (Existing Clients)            │
│     Account Manager, Customer Success...  │
│                                           │
│  ☐ Leadership & Strategy                 │
│     Sales Manager, Director of Sales...   │
│                                           │
│  ☑ Technical Sales                       │
│     Sales Engineer / Pre-Sales +1 more    │
│                                           │
└──────────────────────────────────────────┘
```

### **Subcategory Item - Selected**
```
┌────────────────────────────────────────────┐
│ ☑ Software Development                     │
│   Frontend Developer (React, Vue, Angular),│
│   Backend Developer (Node.js, Python...) +2│
└────────────────────────────────────────────┘
```

### **Subcategory Item - Not Selected**
```
┌────────────────────────────────────────────┐
│ ☐ Data & AI                                │
│   Data Scientist, Data Analyst +3 more     │
└────────────────────────────────────────────┘
```

---

## ✨ Benefits

### **For Users**
✅ **Precision** - Get ONLY the jobs you want  
✅ **Less Noise** - No irrelevant job alerts  
✅ **Flexibility** - Choose broad OR narrow categories  
✅ **Transparency** - See exactly what roles are included  
✅ **Control** - Expand/collapse to explore subcategories  

### **For the Platform**
✅ **Higher Engagement** - Users receive relevant jobs  
✅ **Better Click Rates** - Targeted emails = more clicks  
✅ **Reduced Unsubscribes** - Happy users stay subscribed  
✅ **Data Insights** - Know which subcategories are popular  
✅ **Competitive Advantage** - Most job boards don't offer this  

---

## 🚀 Implementation Status

- ✅ **Frontend:** Expandable category selection UI
- ✅ **Database:** `subcategories` column with GIN index
- ✅ **Constants:** 94 roles across 25 subcategories defined
- ⏳ **Backend:** Email notification matching logic (TODO)
- ⏳ **Email Templates:** Grouped by subcategory (TODO)

---

## 📝 Migration Guide

If you already have the `job_subscriptions` table without the `subcategories` column:

```sql
-- Add column
ALTER TABLE job_subscriptions 
ADD COLUMN IF NOT EXISTS subcategories TEXT[] DEFAULT '{}';

-- Add index
CREATE INDEX IF NOT EXISTS idx_subscriptions_subcategories 
ON job_subscriptions USING GIN(subcategories);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_subscriptions' 
AND column_name = 'subcategories';
```

---

**Last Updated:** January 31, 2026  
**Feature:** Expandable Subcategories in Subscription Form  
**Total Subcategories:** 25 across 7 main categories  
**Total Job Roles:** 94  
