import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: string;
  onRetry: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Log diagnostic info to console ONLY (not visible to users)
  React.useEffect(() => {
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

      // Log to console for developers ONLY
      console.group('🔍 Error Diagnostics (Dev Only)');
      console.log('Supabase URL:', getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || 'NOT SET');
      console.log('Has Supabase Key:', !!(getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY')));
      console.log('Environment:', import.meta.env?.MODE || 'unknown');
      console.log('Error:', error);
      console.groupEnd();
    }
  }, [error]);

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
                {isTimeoutError ? 'Connection Timeout' : 'Unable to Load Jobs'}
              </h2>
              <p className="text-slate-600 mb-4">
                {isTimeoutError 
                  ? 'The database is taking too long to respond. Please try again.' 
                  : 'We encountered an issue loading jobs from the database.'}
              </p>
            </div>
          </div>

          {/* Solution Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">What You Can Do</h3>
            
            {isTimeoutError ? (
              <div className="space-y-3 text-sm text-blue-800">
                <p>This usually resolves itself. Try the following:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>Click "Retry"</strong> below to try loading again</li>
                  <li>Refresh your browser (Ctrl+R or Cmd+R)</li>
                  <li>Check your internet connection</li>
                  <li>If the problem persists, try again in a few minutes</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-blue-800">
                <p>Try these steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li><strong>Click "Retry"</strong> button below</li>
                  <li>Refresh your browser page</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try a different browser or device</li>
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

          {/* Developer Toggle (Hidden by default) */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showDetails ? '▼ Hide' : '▶'} Technical Details (for developers)
            </button>
            {showDetails && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-mono text-slate-600 break-all">
                  Error: {error}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  For more details, open browser console (Press F12)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
