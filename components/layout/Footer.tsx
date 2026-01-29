
import React from 'react';
import { JOB_CATEGORIES } from '../../constants';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, page: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Footer navigation clicked:', page);
    onNavigate(page);
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">
                AJ
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AcrossJob</span>
            </div>
            <p className="text-sm leading-relaxed">
              Modern job search with a network-first approach. Connect with hiring managers and bypass the resume black hole.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {JOB_CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button 
                    onClick={(e) => handleNavClick(e, `category:${cat.id}`)}
                    className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={(e) => handleNavClick(e, 'page:about')} className="hover:text-indigo-400 transition-colors text-left cursor-pointer">About Us</button>
              </li>
              <li>
                <button onClick={(e) => handleNavClick(e, 'page:contact')} className="hover:text-indigo-400 transition-colors text-left cursor-pointer">Contact</button>
              </li>
              <li>
                <button onClick={(e) => handleNavClick(e, 'page:privacy')} className="hover:text-indigo-400 transition-colors text-left cursor-pointer">Privacy Policy</button>
              </li>
              <li>
                <button onClick={(e) => handleNavClick(e, 'page:terms')} className="hover:text-indigo-400 transition-colors text-left cursor-pointer">Terms of Service</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2026 AcrossJob. All rights reserved.</p>
          <div className="flex space-x-6 text-xs">
            <span className="text-slate-500">Connecting talent across borders</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
