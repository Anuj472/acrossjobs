import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthCallbackProps {
  onAuthSuccess: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess }) => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔐 Processing OAuth callback...');
        
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('✅ Access token found, setting session...');
          
          // Supabase will automatically handle the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Session error:', error);
            throw error;
          }
          
          if (data.session) {
            console.log('✅ User authenticated:', data.session.user.email);
            onAuthSuccess();
          } else {
            console.warn('⚠️ No session found');
            window.location.href = '/auth';
          }
        } else {
          console.warn('⚠️ No access token in callback');
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        window.location.href = '/auth?error=authentication_failed';
      }
    };

    handleCallback();
  }, [onAuthSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Completing Sign In...</h2>
        <p className="text-slate-600">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
