import { createClient } from '@supabase/supabase-js';

/**
 * Safely retrieves environment variables from multiple sources:
 * 1. Vite environment variables (import.meta.env) - Production builds
 * 2. Process.env - SSR/Node environment
 * 3. Window.ENV - Client-side injected variables
 */
const getEnvVar = (key: string): string => {
  // Check Vite environment variables (import.meta.env.VITE_*)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
    if (import.meta.env[viteKey]) {
      return import.meta.env[viteKey] as string;
    }
    // Also check without VITE_ prefix
    if (import.meta.env[key]) {
      return import.meta.env[key] as string;
    }
  }
  
  // Check process.env (Node/SSR environment)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Check window.ENV (Client browser environment, injected by SSR)
  if (typeof window !== 'undefined' && (window as any).ENV && (window as any).ENV[key]) {
    return (window as any).ENV[key];
  }

  return '';
};

// Try to get from environment variables with multiple fallback attempts
const SUPABASE_URL = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('SUPABASE_URL') || 
  'https://pfjzheljgnhuxzjbqkpm.supabase.co';

const SUPABASE_ANON_KEY = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('SUPABASE_ANON_KEY') || 
  'sb_publishable_xiIKs63wugMipzKUh_rK3A_dv847JJ3';

// Log configuration in development mode only
if (import.meta.env?.DEV) {
  console.log('🔗 Supabase Configuration:');
  console.log('  URL:', SUPABASE_URL);
  console.log('  Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
}

/**
 * Initialize the Supabase client.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
