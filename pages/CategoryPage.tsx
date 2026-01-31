import React, { useState, useEffect } from 'react';
import { ICONS, JOB_CATEGORIES, REMOTE_STATUSES } from '../constants';
import { JobWithCompany } from '../types';
import JobCard from '../components/jobs/JobCard';
import { storage } from '../db/storage';

interface CategoryPageProps {
  categoryKey: string;
  onNavigate: (page: string) => void;
  allJobs: JobWithCompany[]; // Keep for backward compatibility
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [paginatedJobs, setPaginatedJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const JOBS_PER_PAGE = 20;

  const experienceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Executive', label: 'Executive' },
  ];

  // Fetch paginated jobs when filters or page changes
  useEffect(() => {
    fetchPaginatedJobs();
  }, [actualCategory, currentPage, search, location, jobType, experienceLevel, subcategoryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [actualCategory, search, location, jobType, experienceLevel, subcategoryFilter]);

  // Reset filters when category changes
  useEffect(() => {
    console.log('🔄 Category changed to:', actualCategory);
    setSearch('');
    setLocation('');
    setJobType('all');
    setExperienceLevel('all');
    setSubcategoryFilter('');
    setCurrentPage(1);
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

  const fetchPaginatedJobs = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (actualCategory !== 'all') {
        filters.category = actualCategory;
      }
      
      if (location) {
        filters.location = location;
      }
      
      if (jobType !== 'all') {
        filters.jobType = jobType;
      }
      
      if (experienceLevel !== 'all') {
        filters.experienceLevel = experienceLevel;
      }
      
      // Combine search and subcategory filter
      if (search || subcategoryFilter) {
        filters.search = search || subcategoryFilter;
      }

      const result = await storage.getJobsPaginated(currentPage, JOBS_PER_PAGE, filters);
      
      setPaginatedJobs(result.data);
      setTotalJobs(result.total);
      
      console.log(`📊 Page ${currentPage}: ${result.data.length} jobs (${result.total} total)`);
    } catch (error) {
      console.error('Failed to fetch paginated jobs:', error);
      setPaginatedJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const displayTitle = actualCategory === 'it' ? 'IT & Software' : 
                       currentCategory ? currentCategory.label : 'All Jobs';

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startJob = (currentPage - 1) * JOBS_PER_PAGE + 1;
  const endJob = Math.min(currentPage * JOBS_PER_PAGE, totalJobs);

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
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-8">
        {/* Results info */}
        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{startJob}-{endJob}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalJobs}</span> jobs
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                    …
                  </span>
                );
              }
              
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Mobile: Just show current page */}
          <div className="sm:hidden px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
            {currentPage} / {totalPages}
          </div>

          {/* Next button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    );
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
        <p className="text-lg text-slate-600">
          {loading ? 'Loading...' : `Showing ${totalJobs.toLocaleString()} active opportunities`}
        </p>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading jobs...</p>
            </div>
          ) : paginatedJobs.length > 0 ? (
            <>
              <div className="space-y-4">
                {paginatedJobs.map(job => (
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
              
              {renderPagination()}
            </>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                {ICONS.search}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No matching jobs</h3>
              <p className="text-slate-500 mb-6">
                Try broadening your search or adjusting filters.
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
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;