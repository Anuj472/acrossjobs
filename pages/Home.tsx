import React, { useState, useMemo } from 'react';
import { ICONS, JOB_CATEGORIES, JOB_ROLES } from '../constants';
import { JobWithCompany } from '../types';
import JobCard from '../components/jobs/JobCard';

interface HomeProps {
  onNavigate: (page: string) => void;
  featuredJobs: JobWithCompany[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, featuredJobs }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  // Extract unique locations from all featured jobs for dropdown
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    featuredJobs.forEach(job => {
      if (job.location_city && job.location_country) {
        locations.add(`${job.location_city}, ${job.location_country}`);
      }
    });
    return Array.from(locations).sort();
  }, [featuredJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', search, location);
    onNavigate(`category:all?q=${search}&l=${location}`);
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
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Discover Your Next <span className="text-indigo-400">Career Opportunity</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Browse thousands of job listings from top companies across multiple industries. Find the perfect role that matches your skills and aspirations.
          </p>

          <form 
            onSubmit={handleSearch}
            className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto"
          >
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <span className="text-slate-400 mr-2">{ICONS.search}</span>
              <input 
                type="text" 
                placeholder="Job title or keywords" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-slate-900 py-2"
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2">
              <span className="text-slate-400 mr-2">{ICONS.mapPin}</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full outline-none text-slate-900 py-2 bg-white cursor-pointer"
              >
                <option value="">All Locations</option>
                {availableLocations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-500 transition-all cursor-pointer"
            >
              Search Jobs
            </button>
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
          {JOB_CATEGORIES.map((cat) => {
            const subcategories = Object.keys(JOB_ROLES[cat.id as keyof typeof JOB_ROLES] || {});
            
            return (
              <div 
                key={cat.id}
                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Category Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {ICONS[cat.icon as keyof typeof ICONS]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500">Browse roles</p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {cat.description}
                </p>
                
                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Specializations:</div>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.slice(0, 3).map((subcat, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => handleSubcategoryClick(e, cat.id, subcat)}
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
                  onClick={(e) => handleCategoryClick(e, cat.id)}
                  className="w-full flex items-center justify-center gap-1 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Explore All Jobs {ICONS.chevronRight}
                </button>
              </div>
            );
          })}
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

export default Home;