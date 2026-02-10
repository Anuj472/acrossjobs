import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonicalUrl,
  noindex = false 
}) => {
  const location = useLocation();
  const baseUrl = 'https://acrossjob.com';
  
  // Generate canonical URL
  const canonical = canonicalUrl || `${baseUrl}${location.pathname}`;
  
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update or create canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);
    
    // Update or create robots meta tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    
    if (noindex) {
      metaRobots.setAttribute('content', 'noindex, follow');
    } else {
      metaRobots.setAttribute('content', 'index, follow');
    }
  }, [title, description, canonical, noindex]);
  
  return null;
};
