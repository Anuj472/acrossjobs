
import { createClient } from '@supabase/supabase-js';

// Project ID: pfjzheljgnhuxzjbqkpm
const SUPABASE_URL = 'https://pfjzheljgnhuxzjbqkpm.supabase.co';
// Note: In a production environment, this should be an environment variable.
// Since you provided the DB URL, I'm assuming you have the anon key set up.
const SUPABASE_ANON_KEY = 'sb_publishable_xiIKs63wugMipzKUh_rK3A_dv847JJ3'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
