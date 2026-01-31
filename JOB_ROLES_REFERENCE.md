# Job Roles Reference Guide

This document outlines all job roles organized by category and subcategory in AcrossJobs.

---

## 1. IT & Software (21 roles)

### Software Development (4 roles)
- **Frontend Developer (React, Vue, Angular)** - Building user interfaces with modern frameworks
- **Backend Developer (Node.js, Python, Java, Go)** - Server-side development and APIs
- **Full Stack Developer** - End-to-end application development
- **Mobile App Developer (iOS, Android, Flutter, React Native)** - Native and cross-platform mobile apps

### Data & AI (5 roles)
- **Data Scientist** - Statistical analysis and predictive modeling
- **Data Analyst** - Business intelligence and data visualization
- **Machine Learning Engineer** - ML model development and deployment
- **AI Research Scientist** - Cutting-edge AI research
- **Data Engineer** - Data pipelines and infrastructure

### Infrastructure & Cloud (4 roles)
- **DevOps Engineer** - Automation, CI/CD, and infrastructure as code
- **Cloud Architect (AWS/Azure/GCP)** - Cloud infrastructure design
- **Site Reliability Engineer (SRE)** - System reliability and performance
- **System Administrator** - Server and network management

### Security (4 roles)
- **Cybersecurity Analyst** - Threat detection and prevention
- **Ethical Hacker / Penetration Tester** - Security testing and vulnerability assessment
- **Security Engineer** - Security infrastructure and tools
- **Information Security Specialist** - Security policy and compliance

### Design & Product (3 roles)
- **UI/UX Designer** - User experience and interface design
- **Product Designer** - End-to-end product design
- **Interaction Designer** - User interaction patterns

---

## 2. Management (15 roles)

### Product (4 roles)
- **Product Manager (PM)** - Product strategy and roadmap
- **Associate Product Manager (APM)** - Entry-level product management
- **Product Owner** - Agile product backlog management
- **Technical Product Manager** - Technical product leadership

### Project & Delivery (5 roles)
- **Project Manager** - Project planning and execution
- **Program Manager** - Multi-project coordination
- **Scrum Master** - Agile team facilitation
- **Agile Coach** - Agile transformation and coaching
- **Delivery Manager** - Software delivery oversight

### Operations (4 roles)
- **Operations Manager** - Day-to-day business operations
- **General Manager** - Overall business unit management
- **Strategy Manager** - Strategic planning and execution
- **Business Operations Manager** - Cross-functional operations

### People (HR) (4 roles)
- **HR Manager** - Human resources management
- **Talent Acquisition Specialist (Recruiter)** - Recruitment and hiring
- **HR Business Partner (HRBP)** - HR strategic partnership
- **People Operations Manager** - Employee experience and operations

---

## 3. Finance (11 roles)

### Corporate Finance (4 roles)
- **Financial Analyst** - Financial modeling and analysis
- **Finance Manager** - Financial operations management
- **Chief Financial Officer (CFO)** - Executive financial leadership
- **FP&A Analyst** - Financial planning and analysis

### Accounting & Tax (4 roles)
- **Accountant (Staff/Senior)** - General accounting and bookkeeping
- **Auditor** - Financial audits and compliance
- **Tax Consultant / Tax Analyst** - Tax planning and compliance
- **Controller** - Accounting oversight and financial reporting

### Investment & Banking (5 roles)
- **Investment Banker** - M&A and capital raising
- **Equity Research Analyst** - Stock analysis and recommendations
- **Risk Manager** - Financial risk assessment
- **Portfolio Manager** - Investment portfolio management
- **Quantitative Analyst** - Mathematical finance and modeling

---

## 4. Sales (13 roles)

### Hunting (New Business) (4 roles)
- **Sales Development Representative (SDR)** - Lead generation and qualification
- **Business Development Representative (BDR)** - Outbound prospecting
- **Account Executive (AE)** - Closing new deals
- **Business Development Manager** - Strategic partnerships

### Farming (Existing Clients) (3 roles)
- **Account Manager** - Client relationship management
- **Customer Success Manager (CSM)** - Customer retention and growth
- **Client Relationship Manager** - Long-term client partnerships

### Leadership & Strategy (4 roles)
- **Sales Manager** - Sales team management
- **Director of Sales** - Sales strategy and leadership
- **Sales Operations Analyst** - Sales process optimization
- **VP of Sales** - Executive sales leadership

### Technical Sales (3 roles)
- **Sales Engineer / Pre-Sales Consultant** - Technical sales support
- **Solutions Architect** - Solution design for sales
- **Technical Account Manager** - Technical customer success

---

## 5. Marketing (14 roles)

### Digital (5 roles)
- **Digital Marketing Specialist** - Online marketing campaigns
- **SEO Specialist (Search Engine Optimization)** - Organic search optimization
- **PPC / SEM Specialist (Paid Ads)** - Paid search advertising
- **Social Media Manager** - Social media strategy and content
- **Email Marketing Specialist** - Email campaigns and automation

### Content & Creative (4 roles)
- **Content Writer / Copywriter** - Written content creation
- **Content Strategist** - Content planning and strategy
- **Graphic Designer (Marketing focused)** - Visual design for marketing
- **Video Producer** - Video content creation

### Strategy (5 roles)
- **Marketing Manager** - Marketing team management
- **Product Marketing Manager (PMM)** - Product go-to-market strategy
- **Brand Manager** - Brand strategy and positioning
- **Growth Hacker / Growth Marketer** - Growth experimentation
- **Marketing Director** - Marketing leadership

---

## 6. Legal (10 roles)

### Lawyers/Attorneys (4 roles)
- **Corporate Counsel (In-house)** - In-house legal counsel
- **Associate Attorney** - General legal practice
- **Intellectual Property (IP) Lawyer** - IP protection and litigation
- **Contract Attorney** - Contract drafting and review

### Support & Ops (4 roles)
- **Paralegal** - Legal research and administrative support
- **Legal Assistant** - Administrative legal support
- **Legal Operations Manager** - Legal department operations
- **Contract Manager** - Contract lifecycle management

### Compliance (3 roles)
- **Compliance Officer** - Regulatory compliance
- **Data Privacy Officer** - GDPR/privacy compliance
- **Regulatory Affairs Specialist** - Industry regulation compliance

---

## 7. Research & Development (10 roles)

### Engineering R&D (4 roles)
- **R&D Engineer** - Research and development engineering
- **Hardware Engineer** - Hardware design and development
- **Embedded Systems Engineer** - Embedded software/hardware
- **Product Development Engineer** - New product development

### Science & Bio (4 roles)
- **Research Scientist** - Scientific research
- **Lab Technician** - Laboratory operations
- **Clinical Research Associate** - Clinical trials management
- **Bioinformatics Scientist** - Computational biology

### Innovation (3 roles)
- **Innovation Manager** - Innovation strategy
- **Patent Analyst** - Patent research and analysis
- **Technology Scout** - Technology trend research

---

## Usage in the Application

### Importing Job Roles

```typescript
import { JOB_ROLES, ALL_JOB_ROLES } from './constants';

// Get all roles for a specific category
const itRoles = JOB_ROLES['it'];
// Returns: { 'Software Development': [...], 'Data & AI': [...], ... }

// Get all roles across all categories (flat array)
const allRoles = ALL_JOB_ROLES;
// Returns: [{ role: 'Frontend Developer...', category: 'it', subcategory: 'Software Development' }, ...]
```

### Displaying Roles in UI

```typescript
// Display roles by category
Object.entries(JOB_ROLES['it']).map(([subcategory, roles]) => (
  <div key={subcategory}>
    <h3>{subcategory}</h3>
    <ul>
      {roles.map(role => <li key={role}>{role}</li>)}
    </ul>
  </div>
));
```

### Search Autocomplete

```typescript
// Filter roles for autocomplete
const searchTerm = 'developer';
const matches = ALL_JOB_ROLES.filter(({ role }) =>
  role.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Job Matching

```typescript
// Match job title to standardized role
function matchJobTitle(jobTitle: string) {
  const normalized = jobTitle.toLowerCase();
  
  // Example: "Sr. React.js Ninja" -> "Frontend Developer (React, Vue, Angular)"
  if (normalized.includes('react') || normalized.includes('frontend')) {
    return 'Frontend Developer (React, Vue, Angular)';
  }
  
  // Add more matching logic...
}
```

---

## Total Role Count

| Category | Subcategories | Total Roles |
|----------|--------------|-------------|
| IT & Software | 5 | 21 |
| Management | 4 | 15 |
| Finance | 3 | 11 |
| Sales | 4 | 13 |
| Marketing | 3 | 14 |
| Legal | 3 | 10 |
| R&D | 3 | 10 |
| **TOTAL** | **25** | **94** |

---

## Subscription System Integration

When users subscribe to job alerts, they can:

1. **Select Categories** - Choose from 7 main categories
2. **Future Enhancement** - Allow users to select specific roles or subcategories
3. **Job Matching** - Match incoming jobs to user preferences based on:
   - Category match
   - Role title similarity
   - Keywords from role descriptions

### Example Email Alert

```
Subject: 5 New Frontend Developer Jobs - Daily Digest

Hi John,

Here are today's jobs matching your preferences:

Category: IT & Software > Software Development

1. Senior React Developer @ Google
   Remote | $120k-150k | Apply Now

2. Frontend Engineer @ Facebook
   Hybrid | $130k-160k | Apply Now

...
```

---

## Best Practices for Job Scraping

### Standardizing Job Titles

When scraping jobs from external sources, map messy titles to standardized roles:

```typescript
const titleMappings = {
  // Frontend variations
  'react developer': 'Frontend Developer (React, Vue, Angular)',
  'vue.js engineer': 'Frontend Developer (React, Vue, Angular)',
  'frontend ninja': 'Frontend Developer (React, Vue, Angular)',
  
  // Backend variations
  'node developer': 'Backend Developer (Node.js, Python, Java, Go)',
  'python engineer': 'Backend Developer (Node.js, Python, Java, Go)',
  
  // Data variations
  'ml engineer': 'Machine Learning Engineer',
  'data science': 'Data Scientist',
  
  // Add more mappings...
};
```

### Database Schema

```sql
ALTER TABLE jobs ADD COLUMN standardized_role TEXT;
ALTER TABLE jobs ADD COLUMN role_subcategory TEXT;

-- Example data
INSERT INTO jobs (
  title, 
  standardized_role, 
  role_subcategory,
  category
) VALUES (
  'Sr. React Ninja',
  'Frontend Developer (React, Vue, Angular)',
  'Software Development',
  'it'
);
```

---

## Future Enhancements

### Role-Specific Filters
- Allow users to subscribe to specific subcategories
- Add role-level filtering in job search
- Create landing pages for each role

### Analytics
- Track most popular roles
- Identify emerging job titles
- Salary trends by role

### AI Matching
- Use ML to match job descriptions to standardized roles
- Recommend related roles to users
- Smart job title normalization

---

**Last Updated:** January 31, 2026  
**Total Roles:** 94 across 7 categories and 25 subcategories
