import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Chrome, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔐 Initiating Google login...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Redirecting to Google login...');
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('📧 Creating account with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        }
      });

      if (error) throw error;
      
      console.log('✅ Sign up successful:', data);
      
      // Check if email confirmation is required
      if (data?.user && !data.session) {
        setSuccess('Account created! Please check your email to confirm your account.');
      } else if (data?.session) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => onAuthSuccess(), 1500);
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      setError(error.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('🔑 Signing in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('✅ Sign in successful');
      setSuccess('Signed in successfully! Redirecting...');
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setError(error.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('🔗 Sending password reset link to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });

      if (error) throw error;
      
      setSuccess('Password reset link sent! Please check your email.');
      setTimeout(() => setMode('signin'), 3000);
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      setError(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
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
              {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-slate-600">
              {mode === 'signup' 
                ? 'Sign up to access 5,000+ job listings' 
                : mode === 'forgot'
                ? 'Enter your email to receive a reset link'
                : 'Sign in to continue your job search'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mb-6"
          >
            <Chrome className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={mode === 'signup' ? handleEmailSignUp : mode === 'forgot' ? handlePasswordReset : handleEmailSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password (not shown in forgot mode) */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (only in signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    resetForm();
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  {mode === 'signup' ? 'Creating Account...' : mode === 'forgot' ? 'Sending Link...' : 'Signing In...'}
                </span>
              ) : (
                mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            {mode === 'forgot' ? (
              <p className="text-slate-600">
                Remember your password?
                <button
                  onClick={() => {
                    setMode('signin');
                    resetForm();
                  }}
                  className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-slate-600">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setMode(mode === 'signup' ? 'signin' : 'signup');
                    resetForm();
                  }}
                  className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <button onClick={() => onNavigate('page:terms')} className="underline hover:text-slate-700">Terms of Service</button>
            {' '}and{' '}
            <button onClick={() => onNavigate('page:privacy')} className="underline hover:text-slate-700">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
