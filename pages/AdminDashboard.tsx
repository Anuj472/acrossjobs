
import React, { useState, useEffect } from 'react';
import { ICONS, JOB_CATEGORIES, REMOTE_STATUSES } from '../constants';
import { Company, Job, JobType, JobCategoryType } from '../types';
import { storage } from '../db/storage';

interface AdminDashboardProps {
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [cList, jList] = await Promise.all([
        storage.getCompanies(),
        storage.getJobs()
      ]);
      setCompanies(cList);
      setJobs(jList);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const [newJob, setNewJob] = useState({
    title: '',
    company_id: '',
    category: 'it' as JobCategoryType,
    location_city: '',
    location_country: 'USA',
    salary_range: 'Competitive',
    job_type: 'On-site' as JobType,
    apply_link: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    is_active: true
  });

  // Set initial company_id once companies are loaded
  useEffect(() => {
    if (companies.length > 0 && !newJob.company_id) {
      setNewJob(prev => ({ ...prev, company_id: companies[0].id }));
    }
  }, [companies]);

  const [newCompany, setNewCompany] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website_url: '',
    description: ''
  });

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await storage.addJob({ 
        ...newJob, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setShowAddJob(false);
      fetchAdminData();
      onRefresh(); // Refresh the global state too
    } catch (err) {
      alert("Error adding job. Check console.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await storage.addCompany({
        ...newCompany,
        slug: newCompany.name.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setShowAddCompany(false);
      fetchAdminData();
      onRefresh();
    } catch (err) {
      alert("Error adding company. Check console.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 font-medium">Loading Management Tools...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button onClick={() => setShowAddCompany(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all">
            {ICONS.plus} New Company
          </button>
          <button onClick={() => setShowAddJob(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all">
            {ICONS.plus} Post a Job
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('jobs')} className={`px-6 py-4 font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'jobs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>
          Manage Jobs ({jobs.length})
        </button>
        <button onClick={() => setActiveTab('companies')} className={`px-6 py-4 font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'companies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>
          Manage Companies ({companies.length})
        </button>
      </div>

      {activeTab === 'jobs' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Job Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-6 py-4 font-bold text-slate-900">{job.title}</td>
                  <td className="px-6 py-4 text-slate-600">{companies.find(c => c.id === job.company_id)?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {job.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-indigo-600 font-bold text-sm cursor-pointer hover:underline">Edit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <div key={company.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
              <img src={company.logo_url || ''} className="w-12 h-12 rounded-lg bg-slate-50 p-1 border border-slate-100 object-contain" alt={company.name} />
              <div>
                <h4 className="font-bold text-slate-900">{company.name}</h4>
                <p className="text-sm text-slate-500">{company.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Post a New Job</h2>
            <form onSubmit={handleAddJob} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. Senior IT Manager" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" value={newJob.company_id} onChange={e => setNewJob({...newJob, company_id: e.target.value})}>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" value={newJob.category || 'it'} onChange={e => setNewJob({...newJob, category: e.target.value as JobCategoryType})}>
                    {JOB_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Type</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" value={newJob.job_type} onChange={e => setNewJob({...newJob, job_type: e.target.value as JobType})}>
                    {REMOTE_STATUSES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (HTML allowed)</label>
                <textarea required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl h-48" placeholder="Detailed job description..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200">
                {isSubmitting ? 'Posting...' : 'Post Job Listing'}
              </button>
              <button type="button" onClick={() => setShowAddJob(false)} className="w-full py-2 text-slate-500 font-medium">Discard Changes</button>
            </form>
          </div>
        </div>
      )}

      {showAddCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add Company Profile</h2>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Company Name" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Website URL" value={newCompany.website_url} onChange={e => setNewCompany({...newCompany, website_url: e.target.value})} />
              <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Logo URL" value={newCompany.logo_url} onChange={e => setNewCompany({...newCompany, logo_url: e.target.value})} />
              <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">
                {isSubmitting ? 'Adding...' : 'Create Profile'}
              </button>
              <button type="button" onClick={() => setShowAddCompany(false)} className="w-full py-2 text-slate-500">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
