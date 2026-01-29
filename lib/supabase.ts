
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

const SUPABASE_URL = getEnvVar('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY');

// Log a warning if keys are missing but don't crash the whole module import
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase environment variables are missing. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in the environment.'
  );
}

/**
 * Initialize the Supabase client.
 * We provide fallback 'placeholder' strings only if the keys are actually missing 
 * to prevent the 'supabaseUrl is required' exception from crashing the app bundle immediately.
 */
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_ANON_KEY || 'placeholder-key'
);
