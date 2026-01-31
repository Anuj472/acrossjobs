import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Mail, Briefcase, MapPin, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { JOB_CATEGORIES } from '../constants';

interface SubscriptionFormProps {
  onClose?: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    job_categories: [] as string[],
    job_types: [] as string[],
    locations: '',
    salary_min: '',
    keywords: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const jobTypes = [
    { id: 'full-time', label: 'Full-time' },
    { id: 'part-time', label: 'Part-time' },
    { id: 'contract', label: 'Contract' },
    { id: 'internship', label: 'Internship' },
    { id: 'remote', label: 'Remote' },
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      job_categories: prev.job_categories.includes(categoryId)
        ? prev.job_categories.filter(c => c !== categoryId)
        : [...prev.job_categories, categoryId]
    }));
  };

  const handleJobTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      job_types: prev.job_types.includes(typeId)
        ? prev.job_types.filter(t => t !== typeId)
        : [...prev.job_types, typeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.job_categories.length === 0) {
      setError('Please select at least one job category');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('📧 Creating job subscription...');

      // Insert subscription into Supabase
      const { data, error: insertError } = await supabase
        .from('job_subscriptions')
        .insert([{
          email: formData.email,
          name: formData.name,
          job_categories: formData.job_categories,
          job_types: formData.job_types.length > 0 ? formData.job_types : null,
          locations: formData.locations || null,
          salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
          keywords: formData.keywords || null,
          is_active: true,
          created_at: new Date().toISOString(),
        }]);

      if (insertError) throw insertError;

      console.log('✅ Subscription created successfully');
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
    } catch (err: any) {
      console.error('❌ Subscription error:', err);
      
      if (err.code === '23505') {
        setError('This email is already subscribed. Check your inbox for job notifications!');
      } else {
        setError(err.message || 'Failed to create subscription. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Subscription Confirmed!
          </h2>
          <p className="text-slate-600 mb-4">
            You'll receive email notifications when jobs matching your preferences are posted.
          </p>
          <p className="text-sm text-slate-500">
            Check your inbox for a confirmation email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Get Job Notifications
        </h2>
        <p className="text-slate-600">
          Subscribe to receive email alerts for jobs matching your preferences
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email & Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Job Categories */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Job Categories * (Select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {JOB_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all border-2 ${
                  formData.job_categories.includes(category.id)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Types */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Job Types (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {jobTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleJobTypeToggle(type.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all border-2 ${
                  formData.job_types.includes(type.id)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Preferred Locations (Optional)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={formData.locations}
              onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
              placeholder="e.g., New York, Remote, San Francisco"
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-1">Separate multiple locations with commas</p>
        </div>

        {/* Minimum Salary */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Minimum Salary (Optional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
              placeholder="50000"
              min="0"
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-1">Annual salary in USD</p>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Keywords (Optional)
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="e.g., React, Python, Senior Developer"
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-1">Separate keywords with commas</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Subscribing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              Subscribe to Job Alerts
            </span>
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-slate-500 text-center">
          We'll send you emails only when jobs match your criteria. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
};

export default SubscriptionForm;
