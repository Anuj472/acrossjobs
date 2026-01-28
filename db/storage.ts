
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
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
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
