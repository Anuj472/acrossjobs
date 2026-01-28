
import React, { useEffect, useState } from 'react';
import { JobWithCompany } from '../types';
import { ICONS } from '../constants';
import { formatSalary } from '../lib/utils/format';
import LinkedInReferralButton from '../components/jobs/LinkedInReferralButton';

interface JobDetailPageProps {
  job: JobWithCompany;
  onNavigate: (page: string) => void;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, onNavigate }) => {
  const [imgError, setImgError] = useState(false);

  // Fix for "it" -> "IT" display in breadcrumbs
  const categoryLabel = (cat: string) => {
    if (cat === 'it') return 'IT';
    return cat.replace('-', ' ');
  };

  const companyDesc = job.company.description || "A forward-thinking organization.";
  const aboutText = `${companyDesc} As a prominent leader in the technology sector, this organization prides itself on a culture of excellence, diversity, and rapid innovation. We believe in empowering our employees to take ownership of their career paths while contributing to global solutions that matter. By joining the team at ${job.company.name}, you are stepping into a workspace that values collaboration, integrity, and the pursuit of cutting-edge technology. Our offices are designed to foster creativity, and our benefits reflect our commitment to long-term employee well-being and growth.`;
  
  const truncatedAbout = aboutText.split(' ').slice(0, 90).join(' ') + '...';

  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "datePosted": job.created_at,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company.name,
        "sameAs": job.company.website_url,
        "logo": job.company.logo_url
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location_city,
          "addressCountry": job.location_country
        }
      },
      "employmentType": job.job_type === 'On-site' ? 'FULL_TIME' : job.job_type.toUpperCase()
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const existing = document.head.querySelector('script[type="application/ld+json"]');
      if (existing) document.head.removeChild(existing);
    };
  }, [job]);

  const renderLogo = (className: string) => {
    if (!job.company.logo_url || imgError) {
      return (
        <div className={`${className} bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl border border-indigo-200`}>
          {job.company.name.charAt(0)}
        </div>
      );
    }
    return (
      <img 
        src={job.company.logo_url} 
        alt={job.company.name} 
        onError={() => setImgError(true)}
        className={`${className} object-contain bg-white p-2 border border-slate-100`} 
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-8 flex text-sm text-slate-500 gap-2 items-center">
        <button onClick={() => onNavigate('home')} className="hover:text-indigo-600 transition-colors">Home</button>
        <span className="text-slate-300">/</span>
        <button onClick={() => onNavigate(`category:${job.category || 'all'}`)} className="hover:text-indigo-600 transition-colors uppercase">
          {categoryLabel(job.category || 'Jobs')}
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium truncate max-w-[200px] md:max-w-none">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                {renderLogo("w-20 h-20 rounded-2xl")}
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-1 leading-tight">{job.title}</h1>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="font-semibold text-indigo-600">{job.company.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">{ICONS.mapPin} {job.location_city}, {job.location_country}</span>
                  </div>
                </div>
              </div>
              <a href={job.apply_link} target="_blank" rel="nofollow noopener" className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white text-center font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Apply Now
              </a>
            </div>

            <div className="flex flex-wrap gap-4 py-6 border-y border-slate-100 mb-8">
              <div className="bg-slate-50 px-4 py-2 rounded-lg">
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Salary</span>
                <span className="font-semibold text-slate-900">{formatSalary(job.salary_range)}</span>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-lg">
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Type</span>
                <span className="font-semibold text-slate-900 capitalize">{job.job_type}</span>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-lg">
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Location</span>
                <span className="font-semibold text-slate-900">{job.location_city}</span>
              </div>
            </div>

            <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
              {job.description && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Job Description</h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: job.description }} 
                  />
                </div>
              )}
              
              {job.responsibilities && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Responsibilities</h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: job.responsibilities }} 
                  />
                </div>
              )}

              {job.requirements && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Requirements</h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: job.requirements }} 
                  />
                </div>
              )}
              
              {job.benefits && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Benefits</h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: job.benefits }} 
                  />
                </div>
              )}
            </article>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Networking Advantage</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">Connect with people already working at {job.company.name}. Referrals are 10x more likely to lead to a hire.</p>
              <LinkedInReferralButton jobTitle={job.title} companyName={job.company.name} />
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <h3 className="text-lg font-bold mb-4">About {job.company.name}</h3>
              <div className="flex items-center gap-4 mb-4">
                {renderLogo("w-12 h-12 rounded-xl")}
                <span className="font-bold text-indigo-400">{job.company.name}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">
                {truncatedAbout}
              </p>
              <div className="flex flex-col gap-3">
                <a href={job.company.website_url || '#'} target="_blank" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold">
                  Learn more about company {ICONS.globe}
                </a>
                <a href={job.apply_link} target="_blank" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold">
                  View on Careers Page {ICONS.chevronRight}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
