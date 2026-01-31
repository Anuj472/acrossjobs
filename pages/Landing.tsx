import React from 'react';
import { Briefcase, Globe, Zap, TrendingUp, Users, Shield, Bell, Eye, Code, TrendingUp as Chart, DollarSign, Scale, FlaskConical, UserCircle, Megaphone } from 'lucide-react';
import { JOB_ROLES } from '../constants';

interface LandingProps {
  onNavigate: (page: string) => void;
  onSignUpClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate, onSignUpClick }) => {
  const categories = [
    {
      id: 'it',
      name: 'IT & Software',
      icon: Code,
      description: 'Software development, infrastructure, and data engineering roles.',
      count: '3,200+',
      color: 'indigo',
      subcategories: Object.keys(JOB_ROLES.it || {})
    },
    {
      id: 'management',
      name: 'Management',
      icon: UserCircle,
      description: 'Executive and managerial positions driving business growth.',
      count: '250+',
      color: 'purple',
      subcategories: Object.keys(JOB_ROLES.management || {})
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: TrendingUp,
      description: 'Strategic roles focused on revenue generation and client relations.',
      count: '800+',
      color: 'pink',
      subcategories: Object.keys(JOB_ROLES.sales || {})
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Megaphone,
      description: 'Creative and analytical roles in brand, growth, and communications.',
      count: '450+',
      color: 'orange',
      subcategories: Object.keys(JOB_ROLES.marketing || {})
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      description: 'Financial planning, analysis, and accounting roles.',
      count: '300+',
      color: 'blue',
      subcategories: Object.keys(JOB_ROLES.finance || {})
    },
    {
      id: 'legal',
      name: 'Legal',
      icon: Scale,
      description: 'Legal counsel, compliance, and regulatory affairs positions.',
      count: '150+',
      color: 'green',
      subcategories: Object.keys(JOB_ROLES.legal || {})
    },
    {
      id: 'research-development',
      name: 'Research & Development',
      icon: FlaskConical,
      description: 'Focus on innovation, hardware, and science.',
      count: '200+',
      color: 'teal',
      subcategories: Object.keys(JOB_ROLES['research-development'] || {})
    },
  ];

  const handleSubcategoryClick = (e: React.MouseEvent, categoryId: string, subcategory: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Subcategory clicked:', categoryId, subcategory);
    onNavigate(`category:${categoryId}?subcategory=${encodeURIComponent(subcategory)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
              <Zap className="w-4 h-4" />
              <span>5,000+ Jobs • 100% Free • No Signup Required</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
              Find Your Dream Job
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Across Industries
              </span>
            </h1>
            
            {/* Tagline */}
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed">
              Browse <span className="font-bold text-slate-900">5,000+ job listings</span> from top companies worldwide.
              <span className="block mt-2 font-semibold text-slate-800">IT, Sales, Marketing, Finance, Legal, Management, R&D & More.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('home')}
                className="group relative px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Browse All Jobs Free
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button
                onClick={onSignUpClick}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border-2 border-indigo-200 hover:border-indigo-300 flex items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Get Job Alerts
              </button>
            </div>
            
            <p className="mt-6 text-sm text-slate-500">
              💡 No registration needed to browse • Subscribe for alerts (optional)
            </p>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-black text-indigo-600">5K+</div>
                <div className="text-sm text-slate-600 font-medium">Active Jobs</div>
              </div>
              <div>
                <div className="text-4xl font-black text-indigo-600">100+</div>
                <div className="text-sm text-slate-600 font-medium">Top Companies</div>
              </div>
              <div>
                <div className="text-4xl font-black text-indigo-600">7</div>
                <div className="text-sm text-slate-600 font-medium">Industries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Why Choose AcrossJobs?
            </h2>
            <p className="text-xl text-slate-600">Everything you need to find your perfect role</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-200">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Curated Opportunities</h3>
              <p className="text-slate-600 leading-relaxed">
                Hand-picked roles from industry-leading companies. No spam, only quality positions across all career levels.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Global Reach</h3>
              <p className="text-slate-600 leading-relaxed">
                Access opportunities worldwide. Remote, hybrid, and on-site positions from startups to Fortune 500 companies.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Daily Updates</h3>
              <p className="text-slate-600 leading-relaxed">
                Fresh job listings added every day. Be the first to apply to the newest opportunities in your field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section with Clickable Subcategories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Explore by Industry
            </h2>
            <p className="text-xl text-slate-600">Find opportunities in your domain</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all border-2 border-slate-100 hover:border-indigo-200"
                >
                  {/* Category Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 bg-${category.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${category.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-semibold">{category.count} jobs</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  {/* Clickable Subcategories */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Specializations:</div>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 4).map((subcat, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => handleSubcategoryClick(e, category.id, subcat)}
                          className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-all cursor-pointer"
                        >
                          {subcat}
                        </button>
                      ))}
                      {category.subcategories.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold">
                          +{category.subcategories.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Explore Button */}
                  <button
                    onClick={() => onNavigate(`category:${category.id}`)}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all group-hover:shadow-lg"
                  >
                    Explore Jobs →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Alerts Section - Optional */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white text-center">
            <div className="max-w-3xl mx-auto">
              <Bell className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Never Miss a Perfect Job
              </h2>
              <p className="text-xl opacity-90 mb-4 leading-relaxed">
                Get personalized job alerts delivered to your inbox based on your preferences.
              </p>
              <p className="text-lg opacity-75 mb-8">
                ✓ Choose categories & job types • ✓ Set salary expectations • ✓ Daily or weekly updates
              </p>
              <button
                onClick={onSignUpClick}
                className="px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Subscribe to Job Alerts (Optional)
              </button>
              <p className="mt-4 text-sm opacity-75">100% free • Unsubscribe anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">Simple, fast, and completely free</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Browse Jobs</h3>
              <p className="text-slate-600">
                Instantly access 5,000+ job listings. No signup required, no barriers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Find Your Match</h3>
              <p className="text-slate-600">
                Filter by category, location, salary, and more. Discover opportunities that fit you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Apply Directly</h3>
              <p className="text-slate-600">
                Click to view full details and apply directly to companies. Land your dream job!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Start browsing thousands of opportunities right now. No signup, no hassle, just jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="px-12 py-5 bg-indigo-600 text-white rounded-xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:scale-105"
            >
              Browse All Jobs
            </button>
            <button
              onClick={onSignUpClick}
              className="px-12 py-5 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-bold text-xl hover:bg-indigo-50 transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <Bell className="w-5 h-5" />
              Get Job Alerts
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
