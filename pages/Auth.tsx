import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Chrome, Github, Linkedin, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

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
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-600">
              {mode === 'signup' 
                ? 'Sign up to access 5,000+ job listings' 
                : 'Sign in to continue your job search'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form (Optional - for future) */}
          <div className="space-y-4 opacity-50 pointer-events-none">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  disabled
                />
              </div>
            </div>

            <button
              disabled
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                {mode === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-slate-500 text-center">
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
