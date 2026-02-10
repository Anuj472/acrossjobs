import React, { useState, useMemo, memo, useCallback } from 'react';
import { ICONS, JOB_CATEGORIES, JOB_ROLES, EXPERIENCE_LEVELS, REMOTE_STATUSES } from '../constants';
import { JobWithCompany } from '../types';
import JobCard from '../components/jobs/JobCard';
import { SEO } from '../components/SEO';

interface HomeProps {
  onNavigate: (page: string) => void;
  featuredJobs: JobWithCompany[];
  allJobs: JobWithCompany[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, featuredJobs, allJobs }) => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Extract unique cities from ALL jobs (combined city, country)
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    allJobs.forEach(job => {
      if (job.location_city && job.location_country) {
        cities.add(`${job.location_city}, ${job.location_country}`);
      }
    });
    return Array.from(cities).sort();
  }, [allJobs]);

  // Filter jobs based on search criteria - ALL filters must match (AND logic)
  const filteredJobs = useMemo(() => {
    if (!isSearchActive) {
      return featuredJobs; // Show only featured when not searching
    }

    return allJobs.filter(job => {
      // Keyword check (Title or Company Name)
      const matchesSearch = !search || 
        job.title.toLowerCase().includes(search.toLowerCase()) || 
        job.company.name.toLowerCase().includes(search.toLowerCase());
      
      // City check (matches either city or full "city, country")
      const matchesCity = !city || 
        `${job.location_city}, ${job.location_country}` === city ||
        (job.location_city || '').toLowerCase().includes(city.toLowerCase());

      // Job Type check (Remote, Hybrid, On-site)
      const matchesJobType = !jobType || job.job_type === jobType;

      // Experience level check
      const matchesExperience = !experienceLevel || 
        job.experience_level === experienceLevel;
      
      // ALL conditions must be true (AND logic)
      return matchesSearch && matchesCity && matchesJobType && matchesExperience;
    });
  }, [allJobs, featuredJobs, isSearchActive, search, city, jobType, experienceLevel]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchActive(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setCity('');
    setJobType('');
    setExperienceLevel('');
    setIsSearchActive(false);
  }, []);

  const handleCategoryClick = useCallback((e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(`category:${categoryId}`);
  }, [onNavigate]);

  const handleSubcategoryClick = useCallback((e: React.MouseEvent, categoryId: string, subcategory: string) => {
    e.stopPropagation();
    e.preventDefault();
    onNavigate(`category:${categoryId}?subcategory=${encodeURIComponent(subcategory)}`);
  }, [onNavigate]);

  const handleViewAllClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate('category:all');
  }, [onNavigate]);

  // Build active filter description for display
  const activeFiltersDescription = useMemo(() => {
    const filters = [];
    if (search) filters.push(`"${search}"`);
    if (city) filters.push(`in ${city}`);
    if (jobType) filters.push(REMOTE_STATUSES.find(r => r.value === jobType)?.label || jobType);
    if (experienceLevel) filters.push(experienceLevel);
    return filters.join(' • ');
  }, [search, city, jobType, experienceLevel]);

  return (
    <>
      <SEO 
        title="AcrossJob - Smart Job Search with Network-First Approach"
        description="Find your dream job with AcrossJob. Browse thousands of remote and on-site opportunities across technology, healthcare, finance, marketing, and more. Smart job search made simple."
        canonicalUrl="https://acrossjob.com/"
      />
      
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
              className="bg-white p-3 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-2 max-w-6xl mx-auto"
            >
              {/* Keyword Search */}
              <div className="md:col-span-3 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
                <span className="text-slate-400 mr-2">{ICONS.search}</span>
                <input 
                  type="text" 
                  placeholder="Job title or company" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full outline-none text-slate-900 py-1 text-sm"
                />
              </div>

              {/* City Dropdown */}
              <div className="md:col-span-3 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
                <span className="text-slate-400 mr-2">{ICONS.mapPin}</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full outline-none text-slate-900 py-1 bg-white cursor-pointer text-sm"
                >
                  <option value="">All Locations</option>
                  {availableCities.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Job Type (Remote/Hybrid/On-site) */}
              <div className="md:col-span-2 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
                <span className="text-slate-400 mr-2">{ICONS.home}</span>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full outline-none text-slate-900 py-1 bg-white cursor-pointer text-sm"
                >
                  <option value="">All Types</option>
                  {REMOTE_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="md:col-span-2 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
                <span className="text-slate-400 mr-2">{ICONS.briefcase}</span>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full outline-none text-slate-900 py-1 bg-white cursor-pointer text-sm"
                >
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map((level, idx) => (
                    <option key={idx} value={level.label}>{level.label}</option>
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
            
            {/* Clear Search Button */}
            {isSearchActive && (
              <button
                onClick={handleClearSearch}
                className="mt-4 text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                ✕ Clear search and show featured jobs
              </button>
            )}
            
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
              <span>Popular: Frontend, Product Manager, DevOps, ML Engineer</span>
            </div>
          </div>
        </section>

        {/* Search Results or Categories */}
        {isSearchActive ? (
          /* Search Results Section */
          <section className="max-w-7xl mx-auto px-4 w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Search Results
              </h2>
              <p className="text-slate-600">
                Found {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                {activeFiltersDescription && ` matching ${activeFiltersDescription}`}
              </p>
            </div>
            
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSelect={(j) => onNavigate(`job:${j.id}`)} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                  {ICONS.search}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-500 mb-6">
                  No jobs match all your selected filters.<br />
                  Try adjusting or removing some filters to see more results.
                </p>
                <button 
                  onClick={handleClearSearch}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Default View: Categories + Featured Jobs */
          <>
            {/* Categories Section */}
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
                      onSelect={(j) => onNavigate(`job:${j.id}`)} 
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
          </>
        )}
      </div>
    </>
  );
};

// Memoized CategoryCard component
interface CategoryCardProps {
  category: typeof JOB_CATEGORIES[0];
  onCategoryClick: (e: React.MouseEvent, categoryId: string) => void;
  onSubcategoryClick: (e: React.MouseEvent, categoryId: string, subcategory: string) => void;
}

const CategoryCard = memo<CategoryCardProps>(({ category, onCategoryClick, onSubcategoryClick }) => {
  const subcategories = useMemo(
    () => Object.keys(JOB_ROLES[category.id as keyof typeof JOB_ROLES] || {}),
    [category.id]
  );
  
  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer">
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
      
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {category.description}
      </p>
      
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