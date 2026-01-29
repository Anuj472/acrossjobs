import React, { useState } from 'react';
import { ICONS, JOB_CATEGORIES } from '../constants';
import { JobWithCompany } from '../types';
import JobCard from '../components/jobs/JobCard';

interface HomeProps {
  onNavigate: (page: string) => void;
  featuredJobs: JobWithCompany[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, featuredJobs }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

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

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('View all clicked');
    onNavigate('category:all');
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            The <span className="text-indigo-400">Referral-First</span> Way to Land Your Next Role
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Stop sending resumes into the void. Find top jobs and connect directly with hiring managers on LinkedIn via <span className="text-white font-bold">AcrossJob</span>.
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
              <input 
                type="text" 
                placeholder="City or remote" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full outline-none text-slate-900 py-2"
              />
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-500 transition-all cursor-pointer"
            >
              Search Jobs
            </button>
          </form>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
            <span>Popular: Frontend, Product Manager, DevOps, ML Engineer</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Browse by Industry</h2>
          <p className="text-slate-600">Explore high-impact roles across our primary sectors.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {JOB_CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              onClick={(e) => handleCategoryClick(e, cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(`category:${cat.id}`);
                }
              }}
              className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 mx-auto group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {ICONS[cat.icon as keyof typeof ICONS]}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{cat.label}</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                {cat.description}
              </p>
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-semibold">
                Explore Jobs {ICONS.chevronRight}
              </div>
            </div>
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

export default Home;