import React, { useEffect, useState } from 'react';
import { JobWithCompany } from '../types';
import { ICONS } from '../constants';
import { formatSalary } from '../lib/utils/format';
import { formatJobDescription } from '../lib/utils/html';
import LinkedInReferralButton from '../components/jobs/LinkedInReferralButton';

interface JobDetailPageProps {
  job: JobWithCompany;
  onNavigate: (page: string) => void;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, onNavigate }) => {
  const [imgError, setImgError] = useState(false);

  const categoryLabel = (cat: string) => {
    if (cat === 'it') return 'IT';
    return cat.replace('-', ' ');
  };

  const companyDesc = job.company.description || "A forward-thinking organization.";
  const aboutText = `${companyDesc} At ${job.company.name}, we are building the future. We value innovation, collaboration, and a commitment to excellence. Joining our team means being part of a culture that empowers every individual to make an impact and grow their career in a supportive, high-energy environment.`;
  
  const truncatedAbout = aboutText.split(' ').slice(0, 80).join(' ') + '...';

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
        <div className={`${className} bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl border border-indigo-200 uppercase`}>
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="mb-8 flex text-sm text-slate-500 gap-2 items-center">
        <button onClick={() => onNavigate('home')} className="hover:text-indigo-600 transition-colors">Home</button>
        <span className="text-slate-300">/</span>
        <button onClick={() => onNavigate(`category:${job.category || 'all'}`)} className="hover:text-indigo-600 transition-colors uppercase">
          {categoryLabel(job.category || 'Jobs')}
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium truncate max-w-[200px] md:max-w-none">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-6">
                {renderLogo("w-24 h-24 rounded-2xl shadow-sm")}
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <span className="font-bold text-indigo-600 text-lg">{job.company.name}</span>
                    <span className="hidden md:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-medium">{ICONS.mapPin} {job.location_city}, {job.location_country}</span>
                  </div>
                </div>
              </div>
              <a href={job.apply_link} target="_blank" rel="nofollow noopener" className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white text-center font-bold text-lg rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5">
                Apply Now
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 border-y border-slate-100 mb-12">
              <div>
                <span className="block text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Salary</span>
                <span className="font-bold text-slate-900 text-lg">{formatSalary(job.salary_range)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Work Type</span>
                <span className="font-bold text-slate-900 text-lg capitalize">{job.job_type}</span>
              </div>
              <div className="hidden md:block">
                <span className="block text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Location</span>
                <span className="font-bold text-slate-900 text-lg">{job.location_city}</span>
              </div>
            </div>

            <div className="space-y-12">
              {job.description && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                    Job Description
                  </h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: formatJobDescription(job.description) }} 
                  />
                </section>
              )}
              
              {job.responsibilities && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                    Key Responsibilities
                  </h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: formatJobDescription(job.responsibilities) }} 
                  />
                </section>
              )}

              {job.requirements && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                    What We're Looking For
                  </h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: formatJobDescription(job.requirements) }} 
                  />
                </section>
              )}
              
              {job.benefits && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                    Benefits & Perks
                  </h2>
                  <div 
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: formatJobDescription(job.benefits) }} 
                  />
                </section>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Referral Search</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Referrals increase your chances of getting hired by 10x. Use our tool to find the right people to talk to.
              </p>
              <LinkedInReferralButton jobTitle={job.title} companyName={job.company.name} />
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-5 mb-8">
                {renderLogo("w-16 h-16 rounded-xl")}
                <div>
                  <h3 className="text-xl font-bold leading-tight">About {job.company.name}</h3>
                  <a href={job.company.website_url || '#'} target="_blank" rel="noopener" className="text-indigo-400 text-sm hover:underline flex items-center gap-1 mt-1">
                    Visit Website {ICONS.globe}
                  </a>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 italic">
                {truncatedAbout}
              </p>
              <div className="pt-6 border-t border-slate-800">
                <a href={job.apply_link} target="_blank" rel="noopener" className="flex items-center justify-between w-full group text-indigo-400 font-bold">
                  View Careers Page 
                  <span className="group-hover:translate-x-1 transition-transform">{ICONS.chevronRight}</span>
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
