import React, { useState } from 'react';
import { ICONS, JOB_CATEGORIES } from '../../constants';
import { Bell } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, page: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigation clicked:', page);
    onNavigate(page);
    setIsOpen(false);
  };

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
              <img 
                src="https://drive.google.com/uc?export=view&id=1Xuuu8e60CwTy32gBUVma10jxuiZrwSzX" 
                alt="AcrossJob Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic';
                  fallback.textContent = 'AJ';
                  target.parentElement?.insertBefore(fallback, target);
                }}
              />
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
          
          {/* Desktop Subscribe Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={(e) => handleNavClick(e, 'subscribe')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Bell className="w-4 h-4" />
              <span>Get Job Alerts</span>
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={(e) => handleNavClick(e, 'subscribe')}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            
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