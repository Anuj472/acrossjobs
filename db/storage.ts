
import { supabase } from '../lib/supabase';
import { Company, Job, JobWithCompany } from '../types';

export const storage = {
  getCompanies: async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  getJobs: async (): Promise<Job[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getJobsWithCompanies: async (): Promise<JobWithCompany[]> => {
    let allJobs: JobWithCompany[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    console.log('📥 Starting job fetch with pagination...');

    while (hasMore) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:companies(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        allJobs = [...allJobs, ...data];
        console.log(`✅ Fetched batch: ${data.length} jobs (Total: ${allJobs.length})`);
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`✅ Total jobs loaded: ${allJobs.length}`);
    return allJobs;
  },

  getJobById: async (id: string): Promise<JobWithCompany | null> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  addJob: async (job: Partial<Job>): Promise<void> => {
    const { error } = await supabase
      .from('jobs')
      .insert([job]);
    if (error) throw error;
  },

  addCompany: async (company: Partial<Company>): Promise<void> => {
    const { error } = await supabase
      .from('companies')
      .insert([company]);
    if (error) throw error;
  }
};
