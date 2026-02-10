#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// LinkedIn credentials
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_URN = process.env.LINKEDIN_URN; // e.g., 'urn:li:person:YOUR_ID'

/**
 * Fetch a random unposted job from Supabase
 */
async function fetchUnpostedJob() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .or('linkedin_posted.is.null,linkedin_posted.eq.false')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No unposted jobs found');
      return null;
    }
    
    // Pick a random job from the first 10
    const randomJob = data[Math.floor(Math.random() * data.length)];
    console.log(`Selected job: ${randomJob.title} (ID: ${randomJob.id})`);
    return randomJob;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}

/**
 * Format job data for LinkedIn post
 */
function formatJobPost(job) {
  const url = `https://acrossjobs.com/jobs/${job.id}`;
  
  // Create a compelling post
  let post = `🚀 New Job Opening!\n\n`;
  post += `📌 ${job.title}\n`;
  
  if (job.company_name) {
    post += `🏢 ${job.company_name}\n`;
  }
  
  if (job.location && job.location !== 'Remote') {
    post += `📍 ${job.location}\n`;
  } else if (job.location === 'Remote') {
    post += `🌍 Remote\n`;
  }
  
  if (job.job_type) {
    post += `💼 ${job.job_type}\n`;
  }
  
  if (job.experience_level) {
    post += `🎯 ${job.experience_level}\n`;
  }
  
  if (job.salary_range) {
    post += `💰 ${job.salary_range}\n`;
  }
  
  post += `\n✅ Apply now: ${url}\n\n`;
  post += `#JobOpening #Hiring #CareerOpportunity #Jobs #JobSearch`;
  
  // Add relevant hashtags based on category
  if (job.category) {
    const categoryTag = job.category.replace(/\s+/g, '');
    post += ` #${categoryTag}`;
  }
  
  return post;
}

/**
 * Post to LinkedIn using their API
 */
function postToLinkedIn(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      author: LINKEDIN_URN,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    });

    const options = {
      hostname: 'api.linkedin.com',
      port: 443,
      path: '/v2/ugcPosts',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Restli-Protocol-Version': '2.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('Successfully posted to LinkedIn');
          resolve(JSON.parse(data));
        } else {
          console.error(`Failed to post. Status: ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`LinkedIn API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Mark job as posted in database
 */
async function markJobAsPosted(jobId) {
  const { error } = await supabase
    .from('jobs')
    .update({ 
      linkedin_posted: true,
      linkedin_posted_at: new Date().toISOString()
    })
    .eq('id', jobId);
  
  if (error) {
    console.error('Error marking job as posted:', error);
  } else {
    console.log(`Job ${jobId} marked as posted`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting LinkedIn job posting...');
  console.log(`Time: ${new Date().toISOString()}`);
  
  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_URN) {
    console.error('❌ Missing LinkedIn credentials');
    process.exit(1);
  }
  
  // Fetch a job
  const job = await fetchUnpostedJob();
  if (!job) {
    console.log('No jobs to post');
    process.exit(0);
  }
  
  // Format the post
  const postText = formatJobPost(job);
  console.log('\n--- Post Content ---');
  console.log(postText);
  console.log('--- End ---\n');
  
  // Post to LinkedIn
  try {
    await postToLinkedIn(postText);
    console.log('✅ Successfully posted to LinkedIn');
    
    // Mark as posted
    await markJobAsPosted(job.id);
    
    console.log('✅ Job posting complete!');
  } catch (error) {
    console.error('❌ Failed to post:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
