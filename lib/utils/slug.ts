/**
 * Generate a URL-friendly slug from a job title
 * Handles special characters, spaces, and ensures SEO-friendly format
 */
export function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Remove special characters except spaces, hyphens, and underscores
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length for URL friendliness
    .substring(0, 100);
}

/**
 * Ensure slug uniqueness by appending a counter if needed
 * Used when the same job title exists multiple times
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }
  
  return newSlug;
}
