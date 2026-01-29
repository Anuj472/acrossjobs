import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import JobDetailPage from './pages/JobDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import { AboutUs, Contact, PrivacyPolicy, TermsOfService } from './pages/StaticPages';
import { storage } from './db/storage';
import { JobWithCompany } from './types';

interface AppProps {
  ssrPath?: string;
  initialJobs?: JobWithCompany[];
}

const parsePath = (path: string): string => {
  if (!path) return 'home';
  const cleanPath = path.split('?')[0].replace(/^\/+|\/+$/g, '');
  
  if (!cleanPath || cleanPath === '') return 'home';
  if (cleanPath === 'admin') return 'admin';
  
  if (cleanPath.startsWith('jobs/')) {
    const parts = cleanPath.split('/');
    if (parts.length === 3) return `job:${parts[2]}`;
    if (parts.length === 2) return `category:${parts[1]}`;
    return 'home';
  }
  
  if (cleanPath === 'about-us') return 'page:about';
  if (cleanPath === 'contact') return 'page:contact';
  if (cleanPath === 'privacy') return 'page:privacy';
  if (cleanPath === 'terms') return 'page:terms';
  
  return 'home';
};

const App: React.FC<AppProps> = ({ ssrPath, initialJobs }) => {
  // 1. Initial State from SSR or Window
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (ssrPath) return parsePath(ssrPath);
    if (typeof window !== 'undefined') return parsePath(window.location.pathname);
    return 'home';
  });
  
  const [jobsWithCompany, setJobsWithCompany] = useState<JobWithCompany[]>(() => {
    if (initialJobs && initialJobs.length > 0) return initialJobs;
    if (typeof window !== 'undefined' && (window as any).INITIAL_DATA) {
      return (window as any).INITIAL_DATA;
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    return jobsWithCompany.length === 0;
  });

  // 2. Navigation Logic
  const navigate = useCallback((page: string) => {
    console.info(`AcrossJob: Navigation Triggered -> ${page}`);
    setCurrentPage(page);
    
    let newPath = '/';
    if (page === 'home') newPath = '/';
    else if (page === 'admin') newPath = '/admin';
    else if (page.startsWith('category:')) {
      const cat = page.split(':')[1];
      newPath = `/jobs/${cat}`;
    }
    else if (page.startsWith('job:')) {
      const id = page.split(':')[1];
      const job = jobsWithCompany.find(j => j.id === id);
      newPath = `/jobs/${job?.category || 'all'}/${id}`;
    } 
    else if (page === 'page:about') newPath = '/about-us';
    else if (page === 'page:contact') newPath = '/contact';
    else if (page === 'page:privacy') newPath = '/privacy';
    else if (page === 'page:terms') newPath = '/terms';

    if (typeof window !== 'undefined') {
      window.history.pushState({ page }, '', newPath);
      window.scrollTo(0, 0);
    }
  }, [jobsWithCompany]);

  // 3. Sync state with back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.debug("AcrossJob: Browser Back/Forward navigation detected.");
      setCurrentPage(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchEssentialData = async () => {
    if (jobsWithCompany.length > 0) {
      setLoading(false);
      return;
    }

    try {
      console.debug("AcrossJob: Loading jobs from Supabase...");
      const data = await storage.getJobsWithCompanies();
      setJobsWithCompany(data);
    } catch (e) {
      console.error("AcrossJob: Storage fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEssentialData();
  }, []);

  // 4. Component Router
  const renderPage = () => {
    if (loading && jobsWithCompany.length === 0) return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

    if (currentPage === 'home') return <Home onNavigate={navigate} featuredJobs={jobsWithCompany.slice(0, 5)} />;
    
    if (currentPage === 'admin') return <AdminDashboard onRefresh={fetchEssentialData} />;
    
    if (currentPage.startsWith('category:')) {
      const catKey = currentPage.split(':')[1];
      return <CategoryPage categoryKey={catKey} onNavigate={navigate} allJobs={jobsWithCompany} />;
    }
    
    if (currentPage.startsWith('job:')) {
      const jobId = currentPage.split(':')[1];
      const job = jobsWithCompany.find(j => j.id === jobId);
      if (job) return <JobDetailPage job={job} onNavigate={navigate} />;
      return (
        <div className="p-20 text-center">
          <p className="text-slate-500 mb-6 font-medium">Job listing not found or has expired.</p>
          <button 
            onClick={() => navigate('home')} 
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            Return to Homepage
          </button>
        </div>
      );
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