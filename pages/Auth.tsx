import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Chrome, Github, Linkedin, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ User already logged in');
        onAuthSuccess();
      }
    };
    checkUser();
  }, [onAuthSuccess]);

  const handleSocialLogin = async (provider: 'google' | 'github' | 'azure') => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔐 Initiating ${provider} login...`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Redirecting to', provider, 'login...');
      // Browser will redirect automatically
    } catch (error: any) {
      console.error('❌ Social login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Welcome to AcrossJobs
            </h1>
            <p className="text-slate-600">
              Sign in to access 5,000+ job listings
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Chrome className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 border-2 border-slate-900 rounded-xl font-semibold text-white hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Continue with GitHub</span>
            </button>

            <button
              onClick={() => handleSocialLogin('azure')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 border-2 border-blue-600 rounded-xl font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mt-8 text-xs text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <button onClick={() => onNavigate('page:terms')} className="underline hover:text-slate-700">Terms of Service</button>
            {' '}and{' '}
            <button onClick={() => onNavigate('page:privacy')} className="underline hover:text-slate-700">Privacy Policy</button>.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-medium">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
              <span>Redirecting to login...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
