/**
 * Generate slugs for jobs that don't have them yet
 * Run: npm run generate:slugs
 */
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '../lib/slug';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  No .env file found, using environment variables');
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Create a .env file with:');
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('');
  console.error('Current values:');
  console.error('  VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
  console.error('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '***' + supabaseKey.slice(-4) : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateMissingSlugs() {
  console.log('🔄 Starting slug generation...\n');
  
  try {
    // Fetch jobs without slugs
    const { data: jobsWithoutSlugs, error } = await supabase
      .from('jobs')
      .select('id, title, slug')
      .or('slug.is.null,slug.eq.');

    if (error) {
      console.error('❌ Error fetching jobs:', error);
      return;
    }

    if (!jobsWithoutSlugs || jobsWithoutSlugs.length === 0) {
      console.log('✅ All jobs already have slugs! Nothing to do.');
      return;
    }

    console.log(`📊 Found ${jobsWithoutSlugs.length} jobs without slugs\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const job of jobsWithoutSlugs) {
      const slug = generateSlug(job.title);
      
      // Check if slug exists
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('slug', slug)
        .single();

      let finalSlug = slug;
      
      // If slug exists, append counter
      if (existingJob && existingJob.id !== job.id) {
        let counter = 2;
        let uniqueSlug = `${slug}-${counter}`;
        
        while (true) {
          const { data: duplicate } = await supabase
            .from('jobs')
            .select('id')
            .eq('slug', uniqueSlug)
            .single();
          
          if (!duplicate) {
            finalSlug = uniqueSlug;
            break;
          }
          
          counter++;
          uniqueSlug = `${slug}-${counter}`;
        }
      }
      
      // Update job with slug
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ slug: finalSlug })
        .eq('id', job.id);

      if (updateError) {
        console.error(`❌ Failed to update job ${job.id}:`, updateError.message);
        errorCount++;
      } else {
        const titlePreview = job.title.substring(0, 60) + (job.title.length > 60 ? '...' : '');
        console.log(`✅ [${successCount + 1}/${jobsWithoutSlugs.length}] ${finalSlug}`);
        console.log(`   "${titlePreview}"`);
        successCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY:');
    console.log(`   ✅ Success: ${successCount}`);
    if (errorCount > 0) console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(60));
    console.log('\n🎉 Slug generation complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

generateMissingSlugs();
