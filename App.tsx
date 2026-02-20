import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import JobSubscription from './pages/JobSubscription';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import JobDetailPage from './pages/JobDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import { AboutUs, Contact, PrivacyPolicy, TermsOfService } from './pages/StaticPages';
import { storage } from './db/storage';
import { JobWithCompany } from './types';
import ErrorPage from './pages/ErrorPage';

interface AppProps {
  ssrPath?: string;
  initialJobs?: JobWithCompany[];
}

const parsePath = (path: string): string => {
  if (!path) return 'landing';
  const cleanPath = path.split('?')[0].replace(/^\/+|\/+$/g, '');
  
  if (!cleanPath || cleanPath === '') return 'landing';
  if (cleanPath === 'subscribe') return 'subscribe';
  if (cleanPath === 'admin') return 'admin';
  if (cleanPath === 'jobs') return 'home';
  
  // Handle /job/{slug} pattern (singular) - SEO-friendly URLs
  if (cleanPath.startsWith('job/')) {
    const parts = cleanPath.split('/');
    if (parts.length === 2 && parts[1]) {
      return `job:${parts[1]}`; // parts[1] is now slug instead of UUID
    }
  }
  
  // Handle /jobs/{category}/{slug} pattern (plural)
  if (cleanPath.startsWith('jobs/')) {
    const parts = cleanPath.split('/');
    if (parts.length === 3 && parts[2]) {
      return `job:${parts[2]}`; // parts[2] is now slug
    }
    if (parts.length === 2 && parts[1]) {
      return `category:${parts[1]}`;
    }
    return 'home';
  }
  
  if (cleanPath === 'about-us') return 'page:about';
  if (cleanPath === 'contact') return 'page:contact';
  if (cleanPath === 'privacy') return 'page:privacy';
  if (cleanPath === 'terms') return 'page:terms';
  
  return 'landing';
};

const App: React.FC<AppProps> = ({ ssrPath, initialJobs }) => {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const initialPage = ssrPath ? parsePath(ssrPath) : 
                        (typeof window !== 'undefined' ? parsePath(window.location.pathname) : 'landing');
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

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allJobsLoaded, setAllJobsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback((page: string) => {
    console.group('🔄 AcrossJob Navigation');
    console.log('From:', currentPage);
    console.log('To:', page);
    
    try {
      setCurrentPage(page);
      console.log('✅ State updated to:', page);
      
      let newPath = '/';
      if (page === 'landing') newPath = '/';
      else if (page === 'subscribe') newPath = '/subscribe';
      else if (page === 'home') newPath = '/jobs';
      else if (page === 'admin') newPath = '/admin';
      else if (page.startsWith('category:')) {
        const cat = page.split(':')[1];
        newPath = `/jobs/${cat}`;
      }
      else if (page.startsWith('job:')) {
        const slug = page.split(':')[1];
        // Use SEO-friendly slug in URL instead of UUID
        newPath = `/job/${slug}`;
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ACROSSJOB_DEBUG = {
        currentPage,
        jobCount: jobsWithCompany.length,
        loading,
        loadingMore,
        allJobsLoaded,
        error,
        navigate: (page: string) => {
          console.log('🔧 Manual navigation triggered:', page);
          navigate(page);
        }
      };
    }
  }, [currentPage, jobsWithCompany.length, loading, loadingMore, allJobsLoaded, error, navigate]);

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

  // OPTIMIZED: Load jobs in chunks with timeout protection
  const fetchInitialJobs = async () => {
    if (jobsWithCompany.length > 0) {
      setLoading(false);
      return;
    }

    const timeoutDuration = 10000; // 10 second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - database took too long to respond')), timeoutDuration);
    });

    try {
      console.log("⚡ Fast loading first 50 jobs...");
      setLoading(true);
      setError(null);
      
      // CRITICAL FIX: Use limit parameter to load only initial batch
      const data = await Promise.race([
        storage.getJobsWithCompanies({ limit: 50 }),  // Load first 50 jobs only
        timeoutPromise
      ]) as JobWithCompany[];
      
      console.log(`✅ Loaded initial ${data.length} jobs`);
      setJobsWithCompany(data);
      
      // Trigger background loading after initial render
      setTimeout(() => {
        if (!allJobsLoaded) {
          loadRemainingJobs();
        }
      }, 1000);
    } catch (e: any) {
      console.error("❌ Initial fetch failed:", e);
      const errorMsg = e?.message || 'Failed to load jobs from database';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadRemainingJobs = async () => {
    if (allJobsLoaded || loadingMore) return;

    try {
      console.log("🔄 Loading remaining jobs in background...");
      setLoadingMore(true);
      
      // Load ALL remaining jobs in background
      const allJobs = await storage.getJobsWithCompanies();
      console.log(`✅ Loaded ALL ${allJobs.length} jobs`);
      setJobsWithCompany(allJobs);
      setAllJobsLoaded(true);
    } catch (error) {
      console.error('❌ Failed to load remaining jobs:', error);
      // Don't set error state for background load failure
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (jobsWithCompany.length === 0) {
      fetchInitialJobs();
    }
  }, []);

  const fetchEssentialData = async () => {
    try {
      const allJobs = await storage.getJobsWithCompanies();
      setJobsWithCompany(allJobs);
      setAllJobsLoaded(true);
    } catch (e) {
      console.error('Failed to refresh jobs:', e);
    }
  };

  const renderPage = () => {
    console.log('🎨 Rendering page:', currentPage);
    
    if (currentPage === 'landing') {
      return <Landing onNavigate={navigate} onSignUpClick={() => navigate('subscribe')} />;
    }
    
    if (currentPage === 'subscribe') {
      return <JobSubscription onNavigate={navigate} />;
    }
    
    if (currentPage === 'page:about') return <AboutUs />;
    if (currentPage === 'page:contact') return <Contact />;
    if (currentPage === 'page:privacy') return <PrivacyPolicy />;
    if (currentPage === 'page:terms') return <TermsOfService />;
    
    const needsJobsData = currentPage === 'home' || 
                          currentPage.startsWith('category:') || 
                          currentPage.startsWith('job:');
    
    // Show error page if loading failed
    if (needsJobsData && error) {
      return <ErrorPage error={error} onRetry={fetchInitialJobs} />;
    }
    
    // Show loading only if no jobs at all
    if (needsJobsData && loading && jobsWithCompany.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading jobs...</p>
          <p className="text-slate-400 text-sm mt-2">This should only take a few seconds...</p>
        </div>
      );
    }

    if (currentPage === 'home') {
      return (
        <Home 
          onNavigate={navigate} 
          featuredJobs={jobsWithCompany.slice(0, 5)}
          allJobs={jobsWithCompany}
        />
      );
    }
    
    if (currentPage === 'admin') return <AdminDashboard onRefresh={fetchEssentialData} />;
    
    if (currentPage.startsWith('category:')) {
      const catKey = currentPage.split(':')[1];
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
      const slugOrId = currentPage.split(':')[1];
      
      // Try to find by slug first, then fallback to ID for backward compatibility
      let job = jobsWithCompany.find(j => j.slug === slugOrId);
      if (!job) {
        job = jobsWithCompany.find(j => j.id === slugOrId);
      }
      
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
            Return to Jobs
          </button>
        </div>
      );
    }

    return <Landing onNavigate={navigate} onSignUpClick={() => navigate('subscribe')} />;
  };

  const showMinimalNav = currentPage === 'landing' || currentPage === 'subscribe';

  return (
    <div className="flex flex-col min-h-screen">
      {!showMinimalNav && <Navbar onNavigate={navigate} currentPage={currentPage} />}
      
      <main className="flex-grow">
        {renderPage()}
        
        {loadingMore && (
          <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span className="text-sm font-medium">Loading more jobs... ({jobsWithCompany.length}+)</span>
          </div>
        )}
      </main>
      
      {!showMinimalNav && <Footer onNavigate={navigate} />}
    </div>
  );
};

export default App;
