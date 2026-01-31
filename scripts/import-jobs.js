/**
 * Daily Job Import Script
 * 
 * This script runs daily at 12 PM IST to import jobs into the database.
 * Configure your job sources below.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for imports
);

/**
 * Main import function
 */
async function importJobs() {
  console.log('🚀 Starting job import process...');
  
  try {
    // Step 1: Fetch jobs from your source(s)
    const jobsToImport = await fetchJobsFromSources();
    console.log(`📋 Found ${jobsToImport.length} jobs to process`);
    
    if (jobsToImport.length === 0) {
      console.log('⚠️ No jobs found to import');
      return;
    }
    
    // Step 2: Process and insert jobs
    const results = await processAndInsertJobs(jobsToImport);
    
    // Step 3: Log results
    console.log('✅ Import completed:');
    console.log(`  - New jobs added: ${results.inserted}`);
    console.log(`  - Jobs updated: ${results.updated}`);
    console.log(`  - Jobs skipped: ${results.skipped}`);
    console.log(`  - Errors: ${results.errors}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Fetch jobs from your configured sources
 * TODO: Implement your job source integrations here
 */
async function fetchJobsFromSources() {
  const allJobs = [];
  
  // ==================================================================
  // TODO: Add your job sources here
  // ==================================================================
  
  // Example 1: RemoteOK API
  // const remoteOKJobs = await fetchFromRemoteOK();
  // allJobs.push(...remoteOKJobs);
  
  // Example 2: RSS Feed
  // const rssFeedJobs = await fetchFromRSSFeed('https://example.com/jobs.rss');
  // allJobs.push(...rssFeedJobs);
  
  // Example 3: Custom API
  // const customAPIJobs = await fetchFromCustomAPI();
  // allJobs.push(...customAPIJobs);
  
  // For now, return empty array - you'll implement your sources
  console.log('⚠️ No job sources configured yet. Add your sources in fetchJobsFromSources()');
  
  return allJobs;
}

/**
 * Process and insert jobs into database
 */
async function processAndInsertJobs(jobs) {
  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  for (const job of jobs) {
    try {
      // Ensure company exists first
      const companyId = await ensureCompanyExists(job.company);
      
      // Prepare job data
      const jobData = {
        company_id: companyId,
        title: job.title,
        category: job.category,
        location_city: job.location_city,
        location_country: job.location_country,
        salary_range: job.salary_range || null,
        job_type: job.job_type,
        experience_level: job.experience_level || null,
        apply_link: job.apply_link,
        description: job.description,
        requirements: job.requirements || null,
        responsibilities: job.responsibilities || null,
        benefits: job.benefits || null,
        is_active: true
      };
      
      // Check if job already exists (by title and company)
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId)
        .eq('title', job.title)
        .single();
      
      if (existing) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', existing.id);
        
        if (error) throw error;
        results.updated++;
      } else {
        // Insert new job
        const { error } = await supabase
          .from('jobs')
          .insert([jobData]);
        
        if (error) throw error;
        results.inserted++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing job "${job.title}":`, error.message);
      results.errors++;
    }
  }
  
  return results;
}

/**
 * Ensure company exists in database, create if not
 */
async function ensureCompanyExists(companyData) {
  const slug = companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Check if company exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  // Create new company
  const { data: newCompany, error } = await supabase
    .from('companies')
    .insert([{
      name: companyData.name,
      slug: slug,
      logo_url: companyData.logo_url || null,
      website_url: companyData.website_url || null,
      description: companyData.description || null
    }])
    .select('id')
    .single();
  
  if (error) throw error;
  return newCompany.id;
}

// ==================================================================
// EXAMPLE JOB SOURCE INTEGRATIONS
// Uncomment and customize based on your needs
// ==================================================================

/**
 * Example: Fetch from RemoteOK API
 */
/*
async function fetchFromRemoteOK() {
  const response = await fetch('https://remoteok.com/api');
  const data = await response.json();
  
  return data.slice(1).map(job => ({
    title: job.position,
    company: {
      name: job.company,
      logo_url: job.company_logo,
      website_url: job.url
    },
    category: mapCategoryFromTags(job.tags),
    location_city: null,
    location_country: 'Remote',
    job_type: 'Remote',
    experience_level: null,
    apply_link: job.url,
    description: job.description,
    salary_range: job.salary_range || null
  }));
}
*/

/**
 * Example: Map category from job tags
 */
/*
function mapCategoryFromTags(tags) {
  const tagStr = tags.join(' ').toLowerCase();
  
  if (tagStr.includes('dev') || tagStr.includes('engineer')) return 'it';
  if (tagStr.includes('sales')) return 'sales';
  if (tagStr.includes('marketing')) return 'marketing';
  if (tagStr.includes('design')) return 'research-development';
  if (tagStr.includes('finance')) return 'finance';
  if (tagStr.includes('legal')) return 'legal';
  if (tagStr.includes('manager')) return 'management';
  
  return 'it'; // default
}
*/

// Run the import
importJobs();
