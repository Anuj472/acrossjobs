import React, { useState, useMemo, memo } from 'react';
import { ICONS, JOB_CATEGORIES, JOB_ROLES } from '../constants';
import { JobWithCompany } from '../types';
import JobCard from '../components/jobs/JobCard';

interface HomeProps {
  onNavigate: (page: string) => void;
  featuredJobs: JobWithCompany[];
  allJobs: JobWithCompany[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, featuredJobs, allJobs }) => {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Extract unique countries from ALL jobs for dropdown
  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    allJobs.forEach(job => {
      if (job.location_country) {
        countries.add(job.location_country);
      }
    });
    return Array.from(countries).sort();
  }, [allJobs]);

  // Extract cities for selected country
  const availableCities = useMemo(() => {
    if (!country) return [];
    const cities = new Set<string>();
    allJobs.forEach(job => {
      if (job.location_country === country && job.location_city) {
        cities.add(job.location_city);
      }
    });
    return Array.from(cities).sort();
  }, [allJobs, country]);

  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Executive', label: 'Executive' },
  ];

  // Reset city when country changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    setCity(''); // Reset city
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const location = city ? `${city}, ${country}` : country;
    console.log('Search submitted:', { search, location, experienceLevel });
    
    // Build query params
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (location) params.set('l', location);
    if (experienceLevel) params.set('exp', experienceLevel);
    
    const queryString = params.toString();
    onNavigate(`category:all${queryString ? '?' + queryString : ''}`);
  };

  const handleCategoryClick = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Category clicked:', categoryId);
    onNavigate(`category:${categoryId}`);
  };

  const handleSubcategoryClick = (e: React.MouseEvent, categoryId: string, subcategory: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Subcategory clicked:', categoryId, subcategory);
    onNavigate(`category:${categoryId}?subcategory=${encodeURIComponent(subcategory)}`);
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('View all clicked');
    onNavigate('category:all');
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Discover Your Next <span className="text-indigo-400">Career Opportunity</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Browse thousands of job listings from top companies across multiple industries. Find the perfect role that matches your skills and aspirations.
          </p>

          <form 
            onSubmit={handleSearch}
            className="bg-white p-3 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-2 max-w-5xl mx-auto"
          >
            {/* Keyword Search */}
            <div className="md:col-span-3 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <span className="text-slate-400 mr-2">{ICONS.search}</span>
              <input 
                type="text" 
                placeholder="Job title" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-slate-900 py-1 text-sm"
              />
            </div>

            {/* Country Dropdown */}
            <div className="md:col-span-2 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <span className="text-slate-400 mr-2">{ICONS.globe}</span>
              <select
                value={country}
                onChange={handleCountryChange}
                className="w-full outline-none text-slate-900 py-1 bg-white cursor-pointer text-sm"
              >
                <option value="">All Countries</option>
                {availableCountries.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div className="md:col-span-2 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <span className="text-slate-400 mr-2">{ICONS.mapPin}</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!country}
                className="w-full outline-none text-slate-900 py-1 bg-white cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Cities</option>
                {availableCities.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="md:col-span-3 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <span className="text-slate-400 mr-2">{ICONS.briefcase}</span>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full outline-none text-slate-900 py-1 bg-white cursor-pointer text-sm"
              >
                {experienceLevels.map((level, idx) => (
                  <option key={idx} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-indigo-500 transition-all cursor-pointer text-sm"
              >
                Search
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
            <span>Popular: Frontend, Product Manager, DevOps, ML Engineer</span>
          </div>
        </div>
      </section>

      {/* Categories Section with Subcategories */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Browse by Industry</h2>
          <p className="text-slate-600">Explore high-impact roles across our primary sectors.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {JOB_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onCategoryClick={handleCategoryClick}
              onSubcategoryClick={handleSubcategoryClick}
            />
          ))}
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Opportunities</h2>
              <p className="text-slate-600">Freshly posted roles from top-tier companies.</p>
            </div>
            <button 
              onClick={handleViewAllClick}
              className="hidden sm:flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
            >
              View All Jobs {ICONS.chevronRight}
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {featuredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSelect={(j) => {
                  console.log('Job selected from Home:', j.id);
                  onNavigate(`job:${j.id}`);
                }} 
              />
            ))}
          </div>

          <button 
            onClick={handleViewAllClick}
            className="sm:hidden w-full mt-8 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 cursor-pointer"
          >
            View All Jobs
          </button>
        </div>
      </section>
    </div>
  );
};

// Memoized CategoryCard component to prevent unnecessary re-renders
interface CategoryCardProps {
  category: typeof JOB_CATEGORIES[0];
  onCategoryClick: (e: React.MouseEvent, categoryId: string) => void;
  onSubcategoryClick: (e: React.MouseEvent, categoryId: string, subcategory: string) => void;
}

const CategoryCard = memo<CategoryCardProps>(({ category, onCategoryClick, onSubcategoryClick }) => {
  const subcategories = Object.keys(JOB_ROLES[category.id as keyof typeof JOB_ROLES] || {});
  
  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer">
      {/* Category Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          {ICONS[category.icon as keyof typeof ICONS]}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
            {category.label}
          </h3>
          <p className="text-xs text-slate-500">Browse roles</p>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {category.description}
      </p>
      
      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Specializations:</div>
          <div className="flex flex-wrap gap-2">
            {subcategories.slice(0, 3).map((subcat, idx) => (
              <button
                key={idx}
                onClick={(e) => onSubcategoryClick(e, category.id, subcat)}
                className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-all cursor-pointer"
              >
                {subcat}
              </button>
            ))}
            {subcategories.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold">
                +{subcategories.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Explore Button */}
      <button
        onClick={(e) => onCategoryClick(e, category.id)}
        className="w-full flex items-center justify-center gap-1 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
      >
        Explore All Jobs {ICONS.chevronRight}
      </button>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default memo(Home);