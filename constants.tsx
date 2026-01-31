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

// Detailed job roles for each category
export const JOB_ROLES = {
  'it': {
    'Software Development': [
      'Frontend Developer (React, Vue, Angular)',
      'Backend Developer (Node.js, Python, Java, Go)',
      'Full Stack Developer',
      'Mobile App Developer (iOS, Android, Flutter, React Native)'
    ],
    'Data & AI': [
      'Data Scientist',
      'Data Analyst',
      'Machine Learning Engineer',
      'AI Research Scientist',
      'Data Engineer'
    ],
    'Infrastructure & Cloud': [
      'DevOps Engineer',
      'Cloud Architect (AWS/Azure/GCP)',
      'Site Reliability Engineer (SRE)',
      'System Administrator'
    ],
    'Security': [
      'Cybersecurity Analyst',
      'Ethical Hacker / Penetration Tester',
      'Security Engineer',
      'Information Security Specialist'
    ],
    'Design & Product': [
      'UI/UX Designer',
      'Product Designer',
      'Interaction Designer'
    ]
  },
  'management': {
    'Product': [
      'Product Manager (PM)',
      'Associate Product Manager (APM)',
      'Product Owner',
      'Technical Product Manager'
    ],
    'Project & Delivery': [
      'Project Manager',
      'Program Manager',
      'Scrum Master',
      'Agile Coach',
      'Delivery Manager'
    ],
    'Operations': [
      'Operations Manager',
      'General Manager',
      'Strategy Manager',
      'Business Operations Manager'
    ],
    'People (HR)': [
      'HR Manager',
      'Talent Acquisition Specialist (Recruiter)',
      'HR Business Partner (HRBP)',
      'People Operations Manager'
    ]
  },
  'finance': {
    'Corporate Finance': [
      'Financial Analyst',
      'Finance Manager',
      'Chief Financial Officer (CFO)',
      'FP&A Analyst'
    ],
    'Accounting & Tax': [
      'Accountant (Staff/Senior)',
      'Auditor',
      'Tax Consultant / Tax Analyst',
      'Controller'
    ],
    'Investment & Banking': [
      'Investment Banker',
      'Equity Research Analyst',
      'Risk Manager',
      'Portfolio Manager',
      'Quantitative Analyst'
    ]
  },
  'sales': {
    'Hunting (New Business)': [
      'Sales Development Representative (SDR)',
      'Business Development Representative (BDR)',
      'Account Executive (AE)',
      'Business Development Manager'
    ],
    'Farming (Existing Clients)': [
      'Account Manager',
      'Customer Success Manager (CSM)',
      'Client Relationship Manager'
    ],
    'Leadership & Strategy': [
      'Sales Manager',
      'Director of Sales',
      'Sales Operations Analyst',
      'VP of Sales'
    ],
    'Technical Sales': [
      'Sales Engineer / Pre-Sales Consultant',
      'Solutions Architect',
      'Technical Account Manager'
    ]
  },
  'marketing': {
    'Digital': [
      'Digital Marketing Specialist',
      'SEO Specialist (Search Engine Optimization)',
      'PPC / SEM Specialist (Paid Ads)',
      'Social Media Manager',
      'Email Marketing Specialist'
    ],
    'Content & Creative': [
      'Content Writer / Copywriter',
      'Content Strategist',
      'Graphic Designer (Marketing focused)',
      'Video Producer'
    ],
    'Strategy': [
      'Marketing Manager',
      'Product Marketing Manager (PMM)',
      'Brand Manager',
      'Growth Hacker / Growth Marketer',
      'Marketing Director'
    ]
  },
  'legal': {
    'Lawyers/Attorneys': [
      'Corporate Counsel (In-house)',
      'Associate Attorney',
      'Intellectual Property (IP) Lawyer',
      'Contract Attorney'
    ],
    'Support & Ops': [
      'Paralegal',
      'Legal Assistant',
      'Legal Operations Manager',
      'Contract Manager'
    ],
    'Compliance': [
      'Compliance Officer',
      'Data Privacy Officer',
      'Regulatory Affairs Specialist'
    ]
  },
  'research-development': {
    'Engineering R&D': [
      'R&D Engineer',
      'Hardware Engineer',
      'Embedded Systems Engineer',
      'Product Development Engineer'
    ],
    'Science & Bio': [
      'Research Scientist',
      'Lab Technician',
      'Clinical Research Associate',
      'Bioinformatics Scientist'
    ],
    'Innovation': [
      'Innovation Manager',
      'Patent Analyst',
      'Technology Scout'
    ]
  }
};

// Flat list of all job roles (for autocomplete, search, etc.)
export const ALL_JOB_ROLES = Object.entries(JOB_ROLES).flatMap(([category, subcategories]) =>
  Object.entries(subcategories).flatMap(([subcategory, roles]) =>
    roles.map(role => ({
      role,
      category,
      subcategory
    }))
  )
);

export const JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'it',
    label: 'IT & Software',
    slug: 'it',
    icon: 'code',
    description: 'Software development, infrastructure, and data engineering roles.',
    roleCount: Object.values(JOB_ROLES['it']).flat().length
  },
  {
    id: 'management',
    label: 'Management',
    slug: 'management',
    icon: 'briefcase',
    description: 'Executive and managerial positions driving business growth.',
    roleCount: Object.values(JOB_ROLES['management']).flat().length
  },
  {
    id: 'sales',
    label: 'Sales',
    slug: 'sales',
    icon: 'sales',
    description: 'Strategic roles focused on revenue generation and client relations.',
    roleCount: Object.values(JOB_ROLES['sales']).flat().length
  },
  {
    id: 'marketing',
    label: 'Marketing',
    slug: 'marketing',
    icon: 'marketing',
    description: 'Creative and analytical roles in brand, growth, and communications.',
    roleCount: Object.values(JOB_ROLES['marketing']).flat().length
  },
  {
    id: 'finance',
    label: 'Finance',
    slug: 'finance',
    icon: 'finance',
    description: 'Financial planning, analysis, and accounting roles.',
    roleCount: Object.values(JOB_ROLES['finance']).flat().length
  },
  {
    id: 'legal',
    label: 'Legal',
    slug: 'legal',
    icon: 'legal',
    description: 'Legal counsel, compliance, and regulatory affairs positions.',
    roleCount: Object.values(JOB_ROLES['legal']).flat().length
  },
  {
    id: 'research-development',
    label: 'R&D',
    slug: 'research-development',
    icon: 'flask',
    description: 'Innovation-driven roles in product science and engineering.',
    roleCount: Object.values(JOB_ROLES['research-development']).flat().length
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
  plus: <Plus className="w-5 h-5" />,
  dollarSign: <DollarSign className="w-4 h-4" />
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
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' }
];
