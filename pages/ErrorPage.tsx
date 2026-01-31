import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Info, Database, Key, Globe } from 'lucide-react';

interface ErrorPageProps {
  error: string;
  onRetry: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, onRetry }) => {
  const [diagnostics, setDiagnostics] = useState({
    supabaseUrl: '',
    hasSupabaseKey: false,
    environment: '',
    userAgent: ''
  });

  useEffect(() => {
    // Gather diagnostic info
    if (typeof window !== 'undefined') {
      const getEnvVar = (key: string): string => {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          return import.meta.env[key] || import.meta.env[`VITE_${key}`] || '';
        }
        if ((window as any).ENV && (window as any).ENV[key]) {
          return (window as any).ENV[key];
        }
        return '';
      };

      setDiagnostics({
        supabaseUrl: getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || 'NOT SET',
        hasSupabaseKey: !!(getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY')),
        environment: import.meta.env?.MODE || 'unknown',
        userAgent: navigator.userAgent
      });

      // Log to console for debugging
      console.group('🔍 Diagnostics');
      console.log('Supabase URL:', getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || 'NOT SET');
      console.log('Has Supabase Key:', !!(getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY')));
      console.log('Environment:', import.meta.env?.MODE || 'unknown');
      console.log('Error:', error);
      console.groupEnd();
    }
  }, [error]);

  const isConfigError = !diagnostics.supabaseUrl || diagnostics.supabaseUrl === 'NOT SET' || !diagnostics.hasSupabaseKey;
  const isTimeoutError = error.includes('timeout') || error.includes('took too long');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isConfigError ? 'Configuration Error' : isTimeoutError ? 'Connection Timeout' : 'Failed to Load Jobs'}
              </h2>
              <p className="text-slate-600 mb-4">{error}</p>
            </div>
          </div>

          {/* Diagnostic Information */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Diagnostic Information</h3>
            </div>
            
            <div className="space-y-3">
              {/* Supabase URL */}
              <div className="flex items-start gap-3">
                <Database className={`w-5 h-5 mt-0.5 ${
                  diagnostics.supabaseUrl && diagnostics.supabaseUrl !== 'NOT SET' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`} />
                <div className="flex-grow">
                  <div className="font-medium text-slate-900">Supabase URL</div>
                  <div className={`text-sm ${
                    diagnostics.supabaseUrl && diagnostics.supabaseUrl !== 'NOT SET'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {diagnostics.supabaseUrl === 'NOT SET' 
                      ? '❌ Not configured' 
                      : `✅ ${diagnostics.supabaseUrl.substring(0, 30)}...`}
                  </div>
                </div>
              </div>

              {/* Supabase Key */}
              <div className="flex items-start gap-3">
                <Key className={`w-5 h-5 mt-0.5 ${
                  diagnostics.hasSupabaseKey ? 'text-green-600' : 'text-red-600'
                }`} />
                <div className="flex-grow">
                  <div className="font-medium text-slate-900">Supabase API Key</div>
                  <div className={`text-sm ${
                    diagnostics.hasSupabaseKey ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {diagnostics.hasSupabaseKey ? '✅ Configured' : '❌ Not configured'}
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 mt-0.5 text-slate-600" />
                <div className="flex-grow">
                  <div className="font-medium text-slate-900">Environment</div>
                  <div className="text-sm text-slate-600">
                    {diagnostics.environment}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">How to Fix This</h3>
            
            {isConfigError ? (
              <div className="space-y-3 text-sm text-blue-800">
                <p className="font-medium">Environment variables are missing. Follow these steps:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to your Cloudflare Pages project dashboard</li>
                  <li>Click <strong>Settings</strong> → <strong>Environment variables</strong></li>
                  <li>Add these variables:
                    <div className="bg-white rounded p-3 mt-2 font-mono text-xs">
                      <div>VITE_SUPABASE_URL = https://your-project.supabase.co</div>
                      <div>VITE_SUPABASE_ANON_KEY = your-anon-key</div>
                    </div>
                  </li>
                  <li>Go to <strong>Deployments</strong> tab</li>
                  <li>Click <strong>"Retry deployment"</strong> on the latest deployment</li>
                </ol>
                <p className="mt-4">
                  <strong>Get credentials from:</strong> Supabase Dashboard → Project Settings → API
                </p>
              </div>
            ) : isTimeoutError ? (
              <div className="space-y-3 text-sm text-blue-800">
                <p>The database is taking too long to respond. This could be due to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Supabase free tier rate limiting</li>
                  <li>Large number of jobs in database</li>
                  <li>Network connectivity issues</li>
                </ul>
                <p className="font-medium mt-3">Try:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Retry" below</li>
                  <li>Check your Supabase project status</li>
                  <li>Verify database has active jobs (is_active = true)</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-blue-800">
                <p>Try these steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Retry" button below</li>
                  <li>Check browser console (F12) for detailed errors</li>
                  <li>Verify Supabase project is active</li>
                  <li>Check environment variables in Cloudflare Pages settings</li>
                </ol>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Loading Jobs
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
            >
              Go Home
            </button>
          </div>

          {/* Debug Console Hint */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              For detailed error information, open browser console (Press F12)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
