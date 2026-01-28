
import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import JobDetailPage from './pages/JobDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import { AboutUs, Contact, PrivacyPolicy, TermsOfService } from './pages/StaticPages';
import { storage } from './db/storage';
import { JobWithCompany, Company, Job } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [jobsWithCompany, setJobsWithCompany] = useState<JobWithCompany[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allRawJobs, setAllRawJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#/', '');
      if (!hash) return 'home';
      
      if (hash === 'admin') return 'admin';
      
      if (hash.startsWith('jobs/')) {
        const parts = hash.split('/');
        if (parts.length === 3) return `job:${parts[2]}`;
        return `category:${parts[1]}`;
      }
      
      if (hash.startsWith('page:')) return hash;
      if (hash === 'about-us') return 'page:about';
      if (hash === 'contact') return 'page:contact';
      if (hash === 'privacy') return 'page:privacy';
      if (hash === 'terms') return 'page:terms';
      
      return 'home';
    };

    const handleHashChange = () => {
      setCurrentPage(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    setCurrentPage(parseHash());
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [jwc, companies, rawJobs] = await Promise.all([
        storage.getJobsWithCompanies(),
        storage.getCompanies(),
        storage.getJobs()
      ]);
      setJobsWithCompany(jwc);
      setAllCompanies(companies);
      setAllRawJobs(rawJobs);
    } catch (e) {
      console.error("Failed to fetch data from Supabase", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateHashSafely = (newHash: string) => {
    try {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', newHash);
      } else {
        window.location.hash = newHash;
      }
    } catch (error) {
      console.warn('Navigation restricted.', error);
    }
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'home') updateHashSafely('#/');
    else if (page === 'admin') updateHashSafely('#/admin');
    else if (page.startsWith('category:')) updateHashSafely(`#/jobs/${page.split(':')[1]}`);
    else if (page.startsWith('job:')) {
      const id = page.split(':')[1];
      const job = jobsWithCompany.find(j => j.id === id);
      updateHashSafely(job ? `#/jobs/${job.category || 'all'}/${id}` : `#/jobs/all/${id}`);
    } 
    else if (page === 'page:about') updateHashSafely('#/about-us');
    else if (page === 'page:contact') updateHashSafely('#/contact');
    else if (page === 'page:privacy') updateHashSafely('#/privacy');
    else if (page === 'page:terms') updateHashSafely('#/terms');

    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (loading) return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

    if (currentPage === 'home') return <Home onNavigate={navigate} featuredJobs={jobsWithCompany.slice(0, 5)} />;
    if (currentPage === 'admin') return <AdminDashboard companies={allCompanies} jobs={allRawJobs} onRefresh={refreshData} />;
    if (currentPage.startsWith('category:')) return <CategoryPage categoryKey={currentPage.split(':')[1]} onNavigate={navigate} allJobs={jobsWithCompany} />;
    if (currentPage.startsWith('job:')) {
      const job = jobsWithCompany.find(j => j.id === currentPage.split(':')[1]);
      if (job) return <JobDetailPage job={job} onNavigate={navigate} />;
      return <div className="p-20 text-center">Job not found. <button onClick={() => navigate('home')} className="text-indigo-600 font-bold">Back Home</button></div>;
    }
    if (currentPage === 'page:about') return <AboutUs />;
    if (currentPage === 'page:contact') return <Contact />;
    if (currentPage === 'page:privacy') return <PrivacyPolicy />;
    if (currentPage === 'page:terms') return <TermsOfService />;

    return <Home onNavigate={navigate} featuredJobs={jobsWithCompany.slice(0, 5)} />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={navigate} currentPage={currentPage} />
      <main className="flex-grow">{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default App;
