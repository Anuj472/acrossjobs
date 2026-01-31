import React, { useState, useMemo, useEffect } from 'react';
import { ICONS, JOB_CATEGORIES, REMOTE_STATUSES } from '../constants';
import { JobWithCompany } from '../types';
import JobCard from '../components/jobs/JobCard';

interface CategoryPageProps {
  categoryKey: string;
  onNavigate: (page: string) => void;
  allJobs: JobWithCompany[];
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryKey, onNavigate, allJobs }) => {
  // Parsing potentially dirty categoryKey (e.g. "all?q=dev" or "it?subcategory=Software Development")
  const actualCategory = categoryKey.split('?')[0];
  const currentCategory = JOB_CATEGORIES.find(c => c.id === actualCategory);
  
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<string>('all');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('');

  const experienceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Executive', label: 'Executive' },
  ];

  // CRITICAL FIX: Reset filters when category changes
  useEffect(() => {
    console.log('🔄 Category changed to:', actualCategory);
    setSearch('');
    setLocation('');
    setJobType('all');
    setExperienceLevel('all');
    setSubcategoryFilter('');
  }, [actualCategory]);

  // Handle initial search from URL
  useEffect(() => {
    if (categoryKey.includes('?')) {
      const params = new URLSearchParams(categoryKey.split('?')[1]);
      setSearch(params.get('q') || '');
      setLocation(params.get('l') || '');
      setSubcategoryFilter(params.get('subcategory') || '');
      setExperienceLevel(params.get('exp') || 'all');
    }
  }, [categoryKey]);

  const displayTitle = actualCategory === 'it' ? 'IT & Software' : 
                       currentCategory ? currentCategory.label : 'All Jobs';

  const filteredJobs = useMemo(() => {
    console.log('🔍 Filtering jobs:', {
      totalJobs: allJobs.length,
      category: actualCategory,
      subcategory: subcategoryFilter,
      search,
      location,
      jobType,
      experienceLevel
    });

    const filtered = allJobs.filter(job => {
      // Category check
      const matchesCategory = actualCategory === 'all' || job.category === actualCategory;
      
      // Subcategory check (if provided)
      const matchesSubcategory = !subcategoryFilter || 
        job.title.toLowerCase().includes(subcategoryFilter.toLowerCase());
      
      // Keyword check (Title or Company Name)
      const matchesSearch = !search || 
        job.title.toLowerCase().includes(search.toLowerCase()) || 
        job.company.name.toLowerCase().includes(search.toLowerCase());
      
      // Location check
      const matchesLocation = !location || 
        (job.location_city || '').toLowerCase().includes(location.toLowerCase()) ||
        (job.location_country || '').toLowerCase().includes(location.toLowerCase());

      // Type check
      const matchesType = jobType === 'all' || job.job_type === jobType;
      
      // Experience level check
      const matchesExperience = experienceLevel === 'all' || job.experience_level === experienceLevel;
      
      return matchesCategory && matchesSubcategory && matchesSearch && matchesLocation && matchesType && matchesExperience;
    });

    console.log('✅ Filtered result:', filtered.length, 'jobs');
    return filtered;
  }, [allJobs, actualCategory, subcategoryFilter, search, location, jobType, experienceLevel]);

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Breadcrumb home clicked');
    onNavigate('home');
  };

  const handleClearFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Filters cleared');
    setSearch('');
    setLocation('');
    setJobType('all');
    setExperienceLevel('all');
    setSubcategoryFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <nav className="flex mb-4 text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button 
                type="button"
                onClick={handleBreadcrumbClick} 
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Home
              </button>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-900 uppercase">{actualCategory === 'it' ? 'IT' : actualCategory.replace('-', ' ')}</span>
            </li>
            {subcategoryFilter && (
              <li className="flex items-center space-x-2">
                <span className="text-slate-300">/</span>
                <span className="font-medium text-indigo-600">{subcategoryFilter}</span>
              </li>
            )}
          </ol>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          {displayTitle}
          {subcategoryFilter && <span className="text-indigo-600"> • {subcategoryFilter}</span>}
        </h1>
        <p className="text-lg text-slate-600">Showing {filteredJobs.length} active opportunities</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 sticky top-24 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              {ICONS.search} Filter Results
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Keyword</label>
                <input 
                  type="text"
                  placeholder="e.g. Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input 
                  type="text"
                  placeholder="e.g. Remote"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {REMOTE_STATUSES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <button 
                type="button"
                onClick={handleClearFilters}
                className="w-full text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors pt-2 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {/* CRITICAL FIX: Key prop forces re-render when category changes */}
          <div key={actualCategory}>
            {filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSelect={(j) => {
                      console.log('Job selected from CategoryPage:', j.id);
                      onNavigate(`job:${j.id}`);
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                  {ICONS.search}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No matching jobs</h3>
                <p className="text-slate-500 mb-6">
                  {actualCategory === 'sales' || actualCategory === 'marketing' || actualCategory === 'finance' || actualCategory === 'legal' 
                    ? 'These jobs will appear after you run a fresh harvest in jobcurator with the updated company list.'
                    : 'Try broadening your search or location.'}
                </p>
                <button 
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;