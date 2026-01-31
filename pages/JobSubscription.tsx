import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Briefcase, MapPin, DollarSign, Clock, CheckCircle, AlertCircle, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { JOB_CATEGORIES, JOB_ROLES } from '../constants';

interface JobSubscriptionProps {
  onNavigate: (page: string) => void;
}

const JobSubscription: React.FC<JobSubscriptionProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    selectedCategories: [] as string[],
    selectedSubcategories: [] as string[],
    jobType: [] as string[],
    experienceLevel: '',
    location: '',
    salaryMin: '',
    notificationFrequency: 'daily',
  });

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Manager', 'Executive'];
  const frequencies = [
    { value: 'instant', label: 'Instant (as jobs are posted)' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
  ];

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(c => c !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = formData.selectedCategories.includes(categoryId);
    
    if (isSelected) {
      // Deselect category and all its subcategories
      const subcategories = Object.keys(JOB_ROLES[categoryId as keyof typeof JOB_ROLES] || {});
      setFormData(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.filter(c => c !== categoryId),
        selectedSubcategories: prev.selectedSubcategories.filter(
          sub => !subcategories.some(sc => sub.startsWith(`${categoryId}:${sc}`))
        )
      }));
    } else {
      // Select category
      setFormData(prev => ({
        ...prev,
        selectedCategories: [...prev.selectedCategories, categoryId]
      }));
      // Auto-expand to show subcategories
      if (!expandedCategories.includes(categoryId)) {
        setExpandedCategories([...expandedCategories, categoryId]);
      }
    }
  };

  const handleSubcategoryToggle = (categoryId: string, subcategory: string) => {
    const subcategoryKey = `${categoryId}:${subcategory}`;
    const isSelected = formData.selectedSubcategories.includes(subcategoryKey);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedSubcategories: prev.selectedSubcategories.filter(s => s !== subcategoryKey)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedSubcategories: [...prev.selectedSubcategories, subcategoryKey]
      }));
      // Make sure parent category is selected
      if (!formData.selectedCategories.includes(categoryId)) {
        setFormData(prev => ({
          ...prev,
          selectedCategories: [...prev.selectedCategories, categoryId]
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.selectedCategories.length === 0) {
      setError('Please select at least one job category');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('📝 Submitting subscription:', formData);

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('job_subscriptions')
        .insert([
          {
            email: formData.email,
            name: formData.name,
            categories: formData.selectedCategories,
            subcategories: formData.selectedSubcategories,
            job_types: formData.jobType,
            experience_level: formData.experienceLevel,
            location: formData.location,
            salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
            notification_frequency: formData.notificationFrequency,
            is_active: true,
            created_at: new Date().toISOString(),
          }
        ]);

      if (dbError) throw dbError;

      console.log('✅ Subscription saved successfully');
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          email: '',
          name: '',
          selectedCategories: [],
          selectedSubcategories: [],
          jobType: [],
          experienceLevel: '',
          location: '',
          salaryMin: '',
          notificationFrequency: 'daily',
        });
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('❌ Subscription error:', error);
      setError(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">
              You're Subscribed! 🎉
            </h1>
            <p className="text-slate-600 mb-6">
              We'll send you job alerts matching your preferences to <strong>{formData.email}</strong>
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              Browse Jobs Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Get Your Dream Job Alerts 📬
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tell us what you're looking for, and we'll send you personalized job notifications directly to your inbox.
          </p>
        </div>

        {/* Subscription Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Your Information
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Job Categories with Subcategories */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Job Categories & Specializations *
              </h3>
              <p className="text-sm text-slate-600">Select categories and optionally choose specific specializations</p>
              
              <div className="space-y-3">
                {JOB_CATEGORIES.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id);
                  const isCategorySelected = formData.selectedCategories.includes(category.id);
                  const subcategories = JOB_ROLES[category.id as keyof typeof JOB_ROLES] || {};
                  const hasSubcategories = Object.keys(subcategories).length > 0;

                  return (
                    <div key={category.id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                      {/* Category Header */}
                      <div className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isCategorySelected
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {isCategorySelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                        
                        <div className="flex-1" onClick={() => handleCategoryToggle(category.id)}>
                          <div className="font-bold text-slate-900 cursor-pointer">{category.label}</div>
                          <div className="text-xs text-slate-500">{Object.keys(subcategories).length} specializations</div>
                        </div>
                        
                        {hasSubcategories && (
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-slate-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-600" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {isExpanded && hasSubcategories && (
                        <div className="p-4 bg-white border-t-2 border-slate-200">
                          <div className="space-y-2">
                            {Object.entries(subcategories).map(([subcategory, roles]) => {
                              const subcategoryKey = `${category.id}:${subcategory}`;
                              const isSelected = formData.selectedSubcategories.includes(subcategoryKey);
                              
                              return (
                                <button
                                  key={subcategoryKey}
                                  type="button"
                                  onClick={() => handleSubcategoryToggle(category.id, subcategory)}
                                  className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                                    isSelected
                                      ? 'border-indigo-300 bg-indigo-50'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                    isSelected
                                      ? 'border-indigo-500 bg-indigo-500'
                                      : 'border-slate-300'
                                  }`}>
                                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-900 text-sm">{subcategory}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {(roles as string[]).slice(0, 2).join(', ')}
                                      {(roles as string[]).length > 2 && ` +${(roles as string[]).length - 2} more`}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Job Type */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Job Type
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      jobType: prev.jobType.includes(type)
                        ? prev.jobType.filter(t => t !== type)
                        : [...prev.jobType, type]
                    }))}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                      formData.jobType.includes(type)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Experience Level
              </h3>
              
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="">Any Level</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Preferred Location
              </h3>
              
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Mumbai, Remote, Bangalore"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            {/* Salary Expectation */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Minimum Salary (Optional)
              </h3>
              
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="e.g., 50000"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-sm text-slate-500">Annual salary in your local currency</p>
            </div>

            {/* Notification Frequency */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                How Often Should We Notify You?
              </h3>
              
              <div className="space-y-3">
                {frequencies.map((freq) => (
                  <label
                    key={freq.value}
                    className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-indigo-300 transition-all"
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={freq.value}
                      checked={formData.notificationFrequency === freq.value}
                      onChange={(e) => setFormData({ ...formData, notificationFrequency: e.target.value })}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">{freq.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Subscribing...
                </span>
              ) : (
                '🔔 Subscribe to Job Alerts'
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              By subscribing, you agree to receive job notifications. You can unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobSubscription;
