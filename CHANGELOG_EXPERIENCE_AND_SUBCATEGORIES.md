# Changelog: Experience Filter & Clickable Subcategories

**Date:** January 31, 2026  
**Features:** Experience Level Filter, Experience Display on Job Cards, Clickable Subcategories

---

## 🎉 New Features

### 1. **Experience Level Filter**
Users can now filter jobs by career level in the CategoryPage sidebar.

**Filter Options:**
- All Levels (default)
- Entry Level
- Mid Level  
- Senior Level
- Lead
- Executive

**Location:** CategoryPage.tsx > Sidebar Filters

---

### 2. **Experience Level Display on Job Cards**
Job cards now show the experience level required alongside other job details.

**Display Format:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 🏛️ Google | 📍 San Francisco, USA | 💵 $120k | 💼 Mid Level │
└──────────────────────────────────────────────────────────────────┘
```

**Shown Info (in order):**
1. Company (with icon)
2. Location (with icon)
3. Salary Range (with icon) - if available
4. Experience Level (with icon) - if available

**Location:** JobCard.tsx

---

### 3. **Clickable Subcategories on Landing Page**
Subcategory tags on category cards are now clickable and filter jobs by that specific specialization.

**User Flow:**
1. User sees category card (e.g., "Sales")
2. Sees subcategory tags: [Hunting] [Farming] [Leadership] [Technical Sales]
3. Clicks "Hunting (New Business)"
4. Navigates to Sales category page filtered by "Hunting" roles
5. Only SDR, BDR, AE jobs appear

**URL Format:**
```
category:sales?subcategory=Hunting%20(New%20Business)
```

**Location:** Landing.tsx > Industries Section

---

## 📝 File Changes

### **1. types.ts**
**Changes:**
- Added `ExperienceLevelType` type definition
- Added `experience_level` field to `Job` interface

```typescript
export type ExperienceLevelType = 
  'Entry Level' | 'Mid Level' | 'Senior Level' | 'Lead' | 'Executive' | null;

export interface Job {
  // ... existing fields
  experience_level: ExperienceLevelType;
  // ...
}
```

---

### **2. components/jobs/JobCard.tsx**
**Changes:**
- Added experience level display in job details section
- Conditional rendering (only shows if `job.experience_level` exists)
- Uses briefcase icon (💼) for experience level

**Before:**
```tsx
<div>Company</div>
<div>Location</div>
<div>Salary</div>
```

**After:**
```tsx
<div>Company</div>
<div>Location</div>
{job.salary_range && <div>Salary</div>}
{job.experience_level && <div>Experience</div>}
```

---

### **3. pages/CategoryPage.tsx**
**Changes:**
- Added `experienceLevel` state
- Added `subcategoryFilter` state (for subcategory filtering)
- Added experience level dropdown filter
- Updated filtering logic to include experience level
- Updated breadcrumb to show subcategory if filtered
- Added subcategory to page title

**New Filter:**
```tsx
<select value={experienceLevel} onChange={...}>
  <option value="all">All Levels</option>
  <option value="Entry Level">Entry Level</option>
  <option value="Mid Level">Mid Level</option>
  <option value="Senior Level">Senior Level</option>
  <option value="Lead">Lead</option>
  <option value="Executive">Executive</option>
</select>
```

**Filtering Logic:**
```typescript
const matchesExperience = 
  experienceLevel === 'all' || 
  job.experience_level === experienceLevel;

const matchesSubcategory = 
  !subcategoryFilter || 
  job.title.toLowerCase().includes(subcategoryFilter.toLowerCase());
```

---

### **4. pages/Landing.tsx**
**Changes:**
- Made subcategory tags clickable buttons
- Added `handleSubcategoryClick` function
- Updated styling for hover effects on subcategory tags

**Before:**
```tsx
<span className="...">{subcat}</span>
```

**After:**
```tsx
<button
  onClick={(e) => handleSubcategoryClick(e, category.id, subcat)}
  className="hover:bg-indigo-100 hover:text-indigo-700 cursor-pointer"
>
  {subcat}
</button>
```

**Navigation:**
```typescript
const handleSubcategoryClick = (e, categoryId, subcategory) => {
  e.stopPropagation();
  onNavigate(`category:${categoryId}?subcategory=${encodeURIComponent(subcategory)}`);
};
```

---

### **5. db/migrations/add_experience_level_to_jobs.sql**
**Changes:**
- New migration file to add `experience_level` column to jobs table
- Adds check constraint for valid values
- Creates index for filtering performance

```sql
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS experience_level TEXT;

ALTER TABLE jobs
ADD CONSTRAINT valid_experience_level 
CHECK (experience_level IN (
  'Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'
) OR experience_level IS NULL);

CREATE INDEX idx_jobs_experience_level 
ON jobs(experience_level) 
WHERE experience_level IS NOT NULL;
```

---

## 📊 Data Flow

### **Subcategory Filtering Flow**

```
Landing Page
  ↓
User clicks "Software Development" tag under IT & Software
  ↓
Navigation: category:it?subcategory=Software%20Development
  ↓
CategoryPage receives: categoryKey = "it?subcategory=Software Development"
  ↓
Parse URL params:
  - actualCategory = "it"
  - subcategoryFilter = "Software Development"
  ↓
Filter jobs:
  - matchesCategory: job.category === "it"
  - matchesSubcategory: job.title.includes("Software Development")
  ↓
Display filtered jobs (Frontend Dev, Backend Dev, Full Stack, Mobile)
```

### **Experience Level Filtering Flow**

```
CategoryPage
  ↓
User selects "Senior Level" from dropdown
  ↓
State update: experienceLevel = "Senior Level"
  ↓
Filter jobs:
  - matchesExperience: job.experience_level === "Senior Level"
  ↓
Display only Senior Level positions
```

---

## 🌟 User Experience

### **Example 1: Landing Page Subcategory Click**

**Action:**
1. User visits landing page
2. Sees "Sales" category card
3. Sees subcategories: [Hunting] [Farming] [Leadership] [Technical Sales]
4. Clicks "Technical Sales"

**Result:**
- Navigates to Sales category page
- Breadcrumb shows: Home / SALES / Technical Sales
- Page title: "Sales • Technical Sales"
- Only shows Sales Engineer, Solutions Architect, Technical Account Manager roles

---

### **Example 2: Experience Filter**

**Action:**
1. User on IT & Software category page
2. Sees 1,200 jobs
3. Selects "Entry Level" from Experience filter

**Result:**
- Jobs filtered to show only Entry Level positions
- Count updates (e.g., "Showing 180 active opportunities")
- Each job card displays "Entry Level" badge

---

### **Example 3: Combined Filtering**

**Action:**
1. Click "Software Development" on landing page
2. On category page, select:
   - Location: "Remote"
   - Job Type: "Full-time"
   - Experience Level: "Mid Level"

**Result:**
- Shows only:
  - Software Development roles
  - Full-time positions
  - Remote work
  - Mid Level experience
- Example: "Mid-Level React Developer (Remote, Full-time)"

---

## 🛠️ Technical Details

### **State Management**

**CategoryPage.tsx states:**
```typescript
const [search, setSearch] = useState('');
const [location, setLocation] = useState('');
const [jobType, setJobType] = useState('all');
const [experienceLevel, setExperienceLevel] = useState('all');  // NEW
const [subcategoryFilter, setSubcategoryFilter] = useState(''); // NEW
```

### **URL Parameters**

**Supported params:**
- `?q=` - Search keyword
- `?l=` - Location
- `?subcategory=` - Subcategory filter (NEW)

**Example URLs:**
```
category:it?subcategory=Data%20%26%20AI
category:sales?subcategory=Hunting%20(New%20Business)
category:marketing?subcategory=Digital
```

### **Filter Reset Behavior**

**When category changes:**
- All filters reset to defaults
- Search cleared
- Location cleared
- Job Type = "all"
- Experience Level = "all"
- Subcategory filter cleared

**Exception:** If navigating from subcategory click, subcategory filter is preserved

---

## 📝 Database Schema

### **jobs table**

**New column:**
```sql
experience_level TEXT CHECK (
  experience_level IN (
    'Entry Level',
    'Mid Level', 
    'Senior Level',
    'Lead',
    'Executive'
  ) OR experience_level IS NULL
)
```

**Index:**
```sql
CREATE INDEX idx_jobs_experience_level 
ON jobs(experience_level) 
WHERE experience_level IS NOT NULL;
```

**Performance:**
- Indexed column for fast filtering
- Partial index (only non-null values) saves space
- Supports efficient WHERE clauses

---

## ✅ Testing Checklist

### **Experience Filter**
- [ ] Dropdown shows all 6 options (All Levels + 5 levels)
- [ ] Selecting level filters jobs correctly
- [ ] "Clear all filters" resets experience to "All Levels"
- [ ] Combined with other filters works correctly

### **Experience Display**
- [ ] Shows on job cards when `experience_level` is set
- [ ] Hidden when `experience_level` is null
- [ ] Displays with briefcase icon
- [ ] Appears after salary (if salary exists) or after location

### **Clickable Subcategories**
- [ ] Subcategory tags are clickable
- [ ] Clicking navigates to category page with filter
- [ ] URL contains correct subcategory parameter
- [ ] Jobs are filtered by subcategory
- [ ] Breadcrumb shows subcategory
- [ ] Page title includes subcategory
- [ ] "Explore Jobs" button navigates without subcategory filter

---

## 🚀 Deployment

### **Database Migration**

**Run on Supabase:**
```sql
-- From db/migrations/add_experience_level_to_jobs.sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE jobs ADD CONSTRAINT valid_experience_level ...;
CREATE INDEX idx_jobs_experience_level ...;
```

### **Deploy to Cloudflare**
- Auto-deploys on git push to main
- Changes in types.ts require no build step (TypeScript)
- React components will be bundled and deployed

---

## 📊 Impact

### **User Benefits**
- ✅ More precise job filtering
- ✅ Faster job discovery via subcategories
- ✅ Clear visibility of experience requirements
- ✅ Better career-level matching

### **Platform Benefits**
- ✅ Improved user engagement
- ✅ Reduced time-to-apply
- ✅ Better conversion rates
- ✅ Enhanced SEO with category/subcategory URLs

---

## 🔗 Related Files

- `types.ts` - Type definitions
- `components/jobs/JobCard.tsx` - Job card component
- `pages/CategoryPage.tsx` - Category listing with filters
- `pages/Landing.tsx` - Landing page with clickable subcategories
- `db/migrations/add_experience_level_to_jobs.sql` - Database migration

---

**Last Updated:** January 31, 2026  
**Version:** 2.1.0  
**Status:** ✅ Complete and Ready for Testing
