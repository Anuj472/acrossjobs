import { supabase } from './supabase';
import { Job, Company, JobWithCompany } from '../types';

export const storage = {
  // Get jobs with company details (with optional limit for lazy loading)
  async getJobsWithCompanies(limit?: number): Promise<JobWithCompany[]> {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .order('created_at', { ascending: false });
      
      // Apply limit if provided (for lazy loading)
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) return [];

      // Transform to JobWithCompany format
      return data.map((item: any) => ({
        ...item,
        company: item.company || {}
      })) as JobWithCompany[];
    } catch (error) {
      console.error('Error fetching jobs with companies:', error);
      return [];
    }
  },

  // Get single job by ID
  async getJobById(id: string): Promise<JobWithCompany | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        company: data.company || {}
      } as JobWithCompany;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  },

  // Get jobs by category
  async getJobsByCategory(category: string, limit?: number): Promise<JobWithCompany[]> {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      if (!data) return [];

      return data.map((item: any) => ({
        ...item,
        company: item.company || {}
      })) as JobWithCompany[];
    } catch (error) {
      console.error('Error fetching jobs by category:', error);
      return [];
    }
  },

  // Create new job
  async createJob(job: Partial<Job>): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([job])
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    } catch (error) {
      console.error('Error creating job:', error);
      return null;
    }
  },

  // Update job
  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      return null;
    }
  },

  // Delete job
  async deleteJob(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  },

  // Get all companies
  async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Company[] || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  },

  // Create company
  async createCompany(company: Partial<Company>): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error creating company:', error);
      return null;
    }
  }
};
