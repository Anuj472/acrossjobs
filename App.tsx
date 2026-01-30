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
    const initialPage = ssrPath ? parsePath(ssrPath) : 
                        (typeof window !== 'undefined' ? parsePath(window.location.pathname) : 'home');
    console.log('🎬 AcrossJob: Initial page:', initialPage);
    return initialPage;
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
  
  const [loadingAllJobs, setLoadingAllJobs] = useState(false);
  const [allJobsLoaded, setAllJobsLoaded] = useState(false);

  // 2. Navigation Logic with Enhanced Debugging
  const navigate = useCallback((page: string) => {
    console.group('🔄 AcrossJob Navigation');
    console.log('From:', currentPage);
    console.log('To:', page);
    
    try {
      setCurrentPage(page);
      console.log('✅ State updated to:', page);
      
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

      console.log('📍 New path:', newPath);

      if (typeof window !== 'undefined') {
        window.history.pushState({ page }, '', newPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('✅ URL updated and scrolled to top');
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
    console.groupEnd();
  }, [currentPage, jobsWithCompany]);

  // Debug helper
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ACROSSJOB_DEBUG = {
        currentPage,
        jobCount: jobsWithCompany.length,
        loading,
        loadingAllJobs,
        allJobsLoaded,
        navigate: (page: string) => {
          console.log('🔧 Manual navigation triggered:', page);
          navigate(page);
        }
      };
    }
  }, [currentPage, jobsWithCompany.length, loading, loadingAllJobs, allJobsLoaded, navigate]);

  // 3. Sync state with back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log("⬅️ Browser Back/Forward navigation detected");
      const newPage = parsePath(window.location.pathname);
      console.log("Setting page to:", newPage);
      setCurrentPage(newPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 4. Load ALL jobs in background if SSR only provided partial data
  useEffect(() => {
    const loadAllJobs = async () => {
      // Check if SSR provided partial data
      const isPartialSSR = typeof window !== 'undefined' && (window as any).SSR_PARTIAL_DATA === true;
      
      if (!isPartialSSR || allJobsLoaded || loadingAllJobs) {
        return;
      }
      
      console.log('🔄 SSR provided partial data. Loading ALL jobs in background...');
      setLoadingAllJobs(true);
      
      try {
        const allJobs = await storage.getJobsWithCompanies();
        console.log(`✅ Loaded ALL ${allJobs.length} jobs from database`);
        setJobsWithCompany(allJobs);
        setAllJobsLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load all jobs:', error);
      } finally {
        setLoadingAllJobs(false);
      }
    };
    
    // Delay loading by 1 second to let the page render first
    const timer = setTimeout(loadAllJobs, 1000);
    return () => clearTimeout(timer);
  }, [allJobsLoaded, loadingAllJobs]);

  const fetchEssentialData = async () => {
    if (jobsWithCompany.length > 0) {
      setLoading(false);
      return;
    }

    try {
      console.log("📥 Loading jobs from Supabase...");
      const data = await storage.getJobsWithCompanies();
      console.log(`✅ Loaded ${data.length} jobs`);
      setJobsWithCompany(data);
    } catch (e) {
      console.error("❌ Storage fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEssentialData();
  }, []);

  // Log page changes
  useEffect(() => {
    console.log('📄 Current page changed to:', currentPage);
  }, [currentPage]);

  // 5. Component Router
  const renderPage = () => {
    console.log('🎨 Rendering page:', currentPage);
    
    if (loading && jobsWithCompany.length === 0) return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

    if (currentPage === 'home') return <Home onNavigate={navigate} featuredJobs={jobsWithCompany.slice(0, 5)} />;
    
    if (currentPage === 'admin') return <AdminDashboard onRefresh={fetchEssentialData} />;
    
    if (currentPage.startsWith('category:')) {
      const catKey = currentPage.split(':')[1];
      // CRITICAL FIX: Add key prop to force complete re-mount when category changes
      return (
        <CategoryPage 
          key={catKey} 
          categoryKey={catKey} 
          onNavigate={navigate} 
          allJobs={jobsWithCompany} 
        />
      );
    }
    
    if (currentPage.startsWith('job:')) {
      const jobId = currentPage.split(':')[1];
      const job = jobsWithCompany.find(j => j.id === jobId);
      if (job) return <JobDetailPage job={job} onNavigate={navigate} />;
      return (
        <div className="p-20 text-center">
          <p className="text-slate-500 mb-6 font-medium">Job listing not found or has expired.</p>
          <button 
            onClick={(e) => {
              e.preventDefault();
              navigate('home');
            }} 
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg cursor-pointer"
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
      <main className="flex-grow">
        {renderPage()}
        
        {/* Loading indicator for background job fetch */}
        {loadingAllJobs && (
          <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span className="text-sm font-medium">Loading all {jobsWithCompany.length}+ jobs...</span>
          </div>
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default App;