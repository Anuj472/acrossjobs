import React from 'react';
import { 
  Briefcase, 
  Code, 
  FlaskConical, 
  MapPin, 
  Globe, 
  Building2, 
  Clock, 
  Search,
  ChevronRight,
  Plus,
  TrendingUp,
  Megaphone,
  DollarSign,
  Scale
} from 'lucide-react';
import { JobCategory } from './types';

export const JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'it',
    label: 'IT & Software',
    slug: 'it',
    icon: 'code',
    description: 'Software development, infrastructure, and data engineering roles.'
  },
  {
    id: 'management',
    label: 'Management',
    slug: 'management',
    icon: 'briefcase',
    description: 'Executive and managerial positions driving business growth.'
  },
  {
    id: 'sales',
    label: 'Sales',
    slug: 'sales',
    icon: 'sales',
    description: 'Strategic roles focused on revenue generation and client relations.'
  },
  {
    id: 'marketing',
    label: 'Marketing',
    slug: 'marketing',
    icon: 'marketing',
    description: 'Creative and analytical roles in brand, growth, and communications.'
  },
  {
    id: 'finance',
    label: 'Finance',
    slug: 'finance',
    icon: 'finance',
    description: 'Financial planning, analysis, and accounting roles.'
  },
  {
    id: 'legal',
    label: 'Legal',
    slug: 'legal',
    icon: 'legal',
    description: 'Legal counsel, compliance, and regulatory affairs positions.'
  },
  {
    id: 'research-development',
    label: 'R&D',
    slug: 'research-development',
    icon: 'flask',
    description: 'Innovation-driven roles in product science and engineering.'
  }
];

export const ICONS = {
  briefcase: <Briefcase className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  flask: <FlaskConical className="w-5 h-5" />,
  sales: <TrendingUp className="w-5 h-5" />,
  marketing: <Megaphone className="w-5 h-5" />,
  finance: <DollarSign className="w-5 h-5" />,
  legal: <Scale className="w-5 h-5" />,
  mapPin: <MapPin className="w-4 h-4" />,
  globe: <Globe className="w-4 h-4" />,
  building: <Building2 className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  search: <Search className="w-5 h-5" />,
  chevronRight: <ChevronRight className="w-4 h-4" />,
  plus: <Plus className="w-5 h-5" />
};

export const REMOTE_STATUSES = [
  { value: 'On-site', label: 'On-site' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Contract', label: 'Contract' }
];

export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' }
];

export const EXPERIENCE_LEVELS = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead / Executive' }
];
