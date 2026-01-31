import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ICONS, JOB_CATEGORIES } from '../../constants';
import { LogOut, User, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user?: any; // User object from Supabase
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, page: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigation clicked:', page);
    onNavigate(page);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      console.log('🔐 Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Logged out successfully');
      setShowUserMenu(false);
      
      // Redirect to landing page
      window.location.href = '/';
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // Get user display info
  const userEmail = user?.email || 'User';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              type="button"
              onClick={(e) => handleNavClick(e, 'home')}
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">
                AJ
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">AcrossJob</span>
            </button>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {JOB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => handleNavClick(e, `category:${cat.id}`)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    currentPage.startsWith(`category:${cat.id}`)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      className="w-8 h-8 rounded-full border-2 border-indigo-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                        <p className="text-xs text-slate-500 truncate mt-1">{userEmail}</p>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      className="w-8 h-8 rounded-full border-2 border-indigo-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                </button>
                
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                        <p className="text-xs text-slate-500 truncate mt-1">{userEmail}</p>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none cursor-pointer"
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-b border-slate-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={(e) => handleNavClick(e, `category:${cat.id}`)}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;