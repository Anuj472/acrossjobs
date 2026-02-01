import { storage } from '../db/storage';

// Categories from your site
const CATEGORIES = [
  'IT & Software',
  'Management',
  'Sales',
  'Marketing',
  'Finance',
  'Legal',
  'R&D'
];

const SITE_URL = 'https://acrossjob.com';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    // Get all active jobs
    const jobs = await storage.getJobsWithCompanies({ limit: 1000 });
    
    const currentDate = new Date().toISOString();
    
    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Homepage
    xml += `
      <url>
        <loc>${SITE_URL}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>`;
    
    // Category pages
    CATEGORIES.forEach(category => {
      const slug = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      xml += `
      <url>
        <loc>${SITE_URL}/jobs/${slug}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>`;
    });
    
    // Individual job pages
    jobs.forEach(job => {
      const jobDate = job.updated_at || job.created_at || currentDate;
      xml += `
      <url>
        <loc>${SITE_URL}/jobs/${job.id}</loc>
        <lastmod>${jobDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    });
    
    // Static pages (add more as needed)
    const staticPages = [
      { path: '/about', priority: '0.7' },
      { path: '/contact', priority: '0.7' },
      { path: '/privacy', priority: '0.5' },
      { path: '/terms', priority: '0.5' },
    ];
    
    staticPages.forEach(page => {
      xml += `
      <url>
        <loc>${SITE_URL}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${page.priority}</priority>
      </url>`;
    });
    
    xml += '\n</urlset>';
    
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
