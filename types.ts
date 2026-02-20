export type JobType = 'Remote' | 'On-site' | 'Hybrid' | 'Freelance' | 'Contract';
export type JobCategoryType = 'management' | 'it' | 'research-development' | 'sales' | 'marketing' | 'finance' | 'legal';
export type ExperienceLevelType = 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Lead' | 'Executive' | null;

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  slug: string; // NEW: SEO-friendly URL slug
  category: JobCategoryType | null;
  location_city: string | null;
  location_country: string | null;
  salary_range: string | null;
  job_type: JobType;
  experience_level: ExperienceLevelType;
  apply_link: string;
  description: string | null;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobWithCompany extends Job {
  company: Company;
}

export interface JobCategory {
  id: JobCategoryType;
  label: string;
  icon: string;
  description: string;
  slug: string;
}
