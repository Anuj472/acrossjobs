/**
 * HTML Utilities for Job Descriptions
 * Sanitizes and formats HTML content from various ATS platforms
 */

/**
 * Clean and sanitize HTML from job descriptions
 * Removes potentially harmful tags while preserving formatting
 */
export function sanitizeJobDescription(html: string): string {
  if (!html) return '';
  
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags (but keep inline styles)
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove form tags
  html = html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  // Remove input tags
  html = html.replace(/<input[^>]*>/gi, '');
  
  // Fix common formatting issues from Greenhouse
  html = html.replace(/&nbsp;/g, ' ');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&quot;/g, '"');
  
  // Clean up excessive whitespace
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Remove empty paragraphs
  html = html.replace(/<p>\s*<\/p>/gi, '');
  html = html.replace(/<p>&nbsp;<\/p>/gi, '');
  
  // Clean up multiple <br> tags
  html = html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  
  return html.trim();
}

/**
 * Extract plain text from HTML (for previews, metadata)
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Remove all HTML tags
  let text = html.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.trim();
  
  return text;
}

/**
 * Truncate HTML content to a certain length for previews
 */
export function truncateHtml(html: string, maxLength: number = 200): string {
  const plainText = stripHtmlTags(html);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Check if HTML content is valid and not empty
 */
export function hasValidHtmlContent(html: string): boolean {
  if (!html) return false;
  
  const plainText = stripHtmlTags(html);
  return plainText.trim().length > 0;
}

/**
 * Format job description HTML for display
 * This is the main function to use when displaying job descriptions
 */
export function formatJobDescription(html: string): string {
  if (!html) return '<p>No description available.</p>';
  
  // Sanitize first
  let formatted = sanitizeJobDescription(html);
  
  // If no valid content after sanitization
  if (!hasValidHtmlContent(formatted)) {
    return '<p>No description available.</p>';
  }
  
  // Ensure content is wrapped in a container
  if (!formatted.startsWith('<div') && !formatted.startsWith('<p') && !formatted.startsWith('<h')) {
    formatted = `<p>${formatted}</p>`;
  }
  
  return formatted;
}

/**
 * Extract metadata from job description HTML
 * Useful for creating summaries or previews
 */
export function extractJobMetadata(html: string): {
  title?: string;
  firstParagraph?: string;
  sections: string[];
} {
  if (!html) return { sections: [] };
  
  // Extract first h1 or h2
  const titleMatch = html.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
  const title = titleMatch ? stripHtmlTags(titleMatch[1]) : undefined;
  
  // Extract first paragraph
  const paraMatch = html.match(/<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>)*[^<]*)<\/p>/i);
  const firstParagraph = paraMatch ? stripHtmlTags(paraMatch[1]) : undefined;
  
  // Extract all section headings
  const headingMatches = html.match(/<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi) || [];
  const sections = headingMatches.map(h => stripHtmlTags(h));
  
  return {
    title,
    firstParagraph,
    sections
  };
}
