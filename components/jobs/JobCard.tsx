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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only prevent default if it's a normal left-click without modifiers
    // This allows Ctrl+Click, Middle-click, and Right-click to work normally
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      console.log('JobCard clicked:', job.slug || job.id, job.title);
      onSelect(job);
    }
  };

  const renderLogo = () => {
    if (!job.company.logo_url || imgError) {
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg sm:text-xl border border-indigo-200 uppercase flex-shrink-0">
          {job.company.name.charAt(0)}
        </div>
      );
    }
    return (
      <img 
        src={job.company.logo_url} 
        alt={job.company.name} 
        onError={() => setImgError(true)}
        loading="lazy"
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-contain bg-white p-1 border border-slate-100 flex-shrink-0"
      />
    );
  };

  // Generate SEO-friendly job URL using slug, fallback to ID
  const jobUrl = `/job/${job.slug || job.id}`;

  return (
    <a 
      href={jobUrl}
      onClick={handleClick}
      className={`bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group overflow-hidden block no-underline ${
        isGrid ? 'flex flex-col p-4 sm:p-6' : 'flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 gap-3 sm:gap-5'
      }`}
    >
      <div className={`flex-shrink-0 ${isGrid ? 'mb-3 sm:mb-4' : ''}`}>
        {renderLogo()}
      </div>

      <div className="flex-1 min-w-0 w-full">
        {/* Tags row - mobile optimized */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
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

        {/* Title - Multi-line on mobile, single line on desktop */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 sm:line-clamp-1 leading-snug">
          {job.title}
        </h3>

        {/* Job details - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-1 text-sm text-slate-600">
          {/* Company name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex-shrink-0">{ICONS.building}</span>
            <span className="truncate">{job.company.name}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex-shrink-0">{ICONS.mapPin}</span>
            <span className="truncate">{job.location_city}, {job.location_country}</span>
          </div>

          {/* Salary - only show on larger screens if exists */}
          {job.salary_range && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex-shrink-0">{ICONS.dollarSign}</span>
              <span className="truncate">{formatSalary(job.salary_range)}</span>
            </div>
          )}

          {/* Experience level */}
          {job.experience_level && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex-shrink-0">{ICONS.briefcase}</span>
              <span className="truncate">{job.experience_level}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA Button - Full width on mobile, auto on desktop */}
      <div className={`${
        isGrid 
          ? 'mt-4 sm:mt-6 w-full' 
          : 'mt-3 sm:mt-0 sm:ml-auto w-full sm:w-auto'
      } flex-shrink-0`}>
        <div className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all text-center whitespace-nowrap">
          View Details
        </div>
      </div>
    </a>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(JobCard, (prevProps, nextProps) => {
  return prevProps.job.id === nextProps.job.id && 
         prevProps.variant === nextProps.variant;
});