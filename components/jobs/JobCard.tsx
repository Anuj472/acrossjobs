import React, { useState, useEffect } from 'react';
import { JobWithCompany } from '../../types';
import { ICONS } from '../../constants';
import { formatSalary, formatRelativeDate, formatAbsoluteDate } from '../../lib/utils/format';

interface JobCardProps {
  job: JobWithCompany;
  onSelect: (job: JobWithCompany) => void;
  variant?: 'grid' | 'list';
}

const JobCard: React.FC<JobCardProps> = ({ job, onSelect, variant = 'list' }) => {
  const isGrid = variant === 'grid';
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after first render to safely show relative dates
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // We handle the click for the entire card
    onSelect(job);
  };

  const renderLogo = () => {
    if (!job.company.logo_url || imgError) {
      return (
        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl border border-indigo-200 uppercase">
          {job.company.name.charAt(0)}
        </div>
      );
    }
    return (
      <img 
        src={job.company.logo_url} 
        alt={job.company.name} 
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-slate-100"
      />
    );
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group overflow-hidden ${
        isGrid ? 'flex flex-col p-6' : 'flex flex-col sm:flex-row items-start sm:items-center p-5 gap-5'
      }`}
    >
      <div className={`flex-shrink-0 ${isGrid ? 'mb-4' : ''}`}>
        {renderLogo()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
            {job.job_type}
          </span>
          <span 
            className="text-xs text-slate-500" 
            suppressHydrationWarning
          >
            {mounted ? formatRelativeDate(job.created_at) : formatAbsoluteDate(job.created_at)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
          {job.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            {ICONS.building}
            <span className="truncate max-w-[150px]">{job.company.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {ICONS.mapPin}
            <span>{job.location_city}, {job.location_country}</span>
          </div>
          <div className="flex items-center gap-1">
            {ICONS.briefcase}
            <span>{formatSalary(job.salary_range)}</span>
          </div>
        </div>
      </div>

      <div className={`${isGrid ? 'mt-6' : 'sm:ml-auto'} flex-shrink-0`}>
        <div className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all text-center">
          View Details
        </div>
      </div>
    </div>
  );
};

export default JobCard;