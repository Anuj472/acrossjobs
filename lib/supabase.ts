import { createClient } from '@supabase/supabase-js';

/**
 * Safely retrieves environment variables from either the server-side process.env
 * or the client-side window.ENV injected by our SSR function.
 */
const getEnvVar = (key: string): string => {
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

// Use provided production keys as reliable fallbacks
const SUPABASE_URL = getEnvVar('SUPABASE_URL') || 'https://pfjzheljgnhuxzjbqkpm.supabase.co';
const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY') || 'sb_publishable_xiIKs63wugMipzKUh_rK3A_dv847JJ3';

/**
 * Initialize the Supabase client.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);