import { supabase } from '../lib/supabase';
import { Job, Company, JobWithCompany } from '../types';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const storage = {
  /**
   * Get jobs with pagination support
   * CRITICAL: Supabase has 1000 row default limit!
   * Use range() to access all 6406+ jobs
   */
  async getJobsWithCompanies(
    options?: {
      limit?: number;
      offset?: number;
      category?: string;
      location?: string;
      jobType?: string;
      experienceLevel?: string;
      search?: string;
    }
  ): Promise<JobWithCompany[]> {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      if (options?.jobType) {
        query = query.eq('job_type', options.jobType);
      }
      
      if (options?.experienceLevel) {
        query = query.eq('experience_level', options.experienceLevel);
      }
      
      if (options?.location) {
        query = query.or(`location_city.ilike.%${options.location}%,location_country.ilike.%${options.location}%`);
      }
      
      // Simple title-only search
      if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
      }
      
      // Apply pagination using range() instead of limit()
      // This allows us to bypass the 1000 row limit
      if (options?.limit !== undefined && options?.offset !== undefined) {
        const from = options.offset;
        const to = options.offset + options.limit - 1;
        query = query.range(from, to);
        console.log(`📄 Loading jobs ${from}-${to}...`);
      } else if (options?.limit) {
        // Just limit, no offset
        query = query.range(0, options.limit - 1);
        console.log(`⚡ Fast loading first ${options.limit} jobs...`);
      } else {
        // NO LIMIT - Load ALL jobs using multiple queries if needed
        console.log('📥 Loading ALL jobs (may require multiple queries)...');
        return await this.getAllJobsUnlimited();
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) return [];

      console.log(`✅ Loaded ${data.length} jobs`);
      
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

  /**
   * Load ALL jobs without limit
   * Handles Supabase 1000 row limit by fetching in batches
   */
  async getAllJobsUnlimited(): Promise<JobWithCompany[]> {
    const BATCH_SIZE = 1000;
    let allJobs: JobWithCompany[] = [];
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            company:companies(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + BATCH_SIZE - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          const jobs = data.map((item: any) => ({
            ...item,
            company: item.company || {}
          })) as JobWithCompany[];
          
          allJobs = [...allJobs, ...jobs];
          console.log(`📦 Loaded batch: ${allJobs.length} total jobs so far...`);
          
          // If we got less than BATCH_SIZE, we've reached the end
          if (data.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            offset += BATCH_SIZE;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error in batch fetch:', error);
        hasMore = false;
      }
    }

    console.log(`✅ Loaded ALL ${allJobs.length} jobs!`);
    return allJobs;
  },

  /**
   * Get paginated jobs with total count
   * Perfect for pagination UI
   */
  async getJobsPaginated(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      category?: string;
      location?: string;
      jobType?: string;
      experienceLevel?: string;
      search?: string;
    }
  ): Promise<PaginatedResult<JobWithCompany>> {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.jobType) query = query.eq('job_type', filters.jobType);
      if (filters?.experienceLevel) query = query.eq('experience_level', filters.experienceLevel);
      if (filters?.location) {
        query = query.or(`location_city.ilike.%${filters.location}%,location_country.ilike.%${filters.location}%`);
      }
      
      // Simple title-only search
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      // Calculate range
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;

      if (error) throw error;

      const jobs = (data || []).map((item: any) => ({
        ...item,
        company: item.company || {}
      })) as JobWithCompany[];

      const total = count || 0;
      const totalPages = Math.ceil(total / perPage);

      console.log(`📄 Page ${page}/${totalPages} - Showing ${jobs.length} of ${total} jobs`);

      return {
        data: jobs,
        total,
        page,
        perPage,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching paginated jobs:', error);
      return {
        data: [],
        total: 0,
        page,
        perPage,
        totalPages: 0
      };
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

  // Get jobs by category (with unlimited support)
  async getJobsByCategory(category: string, limit?: number): Promise<JobWithCompany[]> {
    return this.getJobsWithCompanies({
      category,
      limit: limit || undefined
    });
  },

  // Get total job count
  async getTotalJobCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting job count:', error);
      return 0;
    }
  },

  // Get job counts by category
  async getJobCountsByCategory(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((job: any) => {
        counts[job.category] = (counts[job.category] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Error getting category counts:', error);
      return {};
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
