/**
 * Generate a URL-safe slug from a job title
 * Converts title to lowercase, replaces special chars with hyphens
 * and optionally appends a short ID for uniqueness
 */
export function generateSlug(title: string, id?: string): string {
  if (!title) {
    return id ? `job-${id.split('-')[0]}` : 'untitled-job';
  }

  // Convert to lowercase and remove special characters
  let slug = title
    .toLowerCase()
    .trim()
    // Replace ampersands with 'and'
    .replace(/&/g, 'and')
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove trailing hyphen if truncation created one
    .replace(/-+$/, '');

  // Optionally append short ID for uniqueness (first 8 chars of UUID)
  if (id) {
    const shortId = id.split('-')[0];
    slug = `${slug}-${shortId}`;
  }

  return slug;
}

/**
 * Extract the ID from a slug that has ID appended
 * Example: "senior-engineer-5edb9c26" -> "5edb9c26"
 */
export function extractIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  
  // Try to extract the last segment that looks like an ID
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like a UUID segment (8 hex chars)
  if (lastPart && /^[a-f0-9]{8}$/i.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}

/**
 * Validate if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a slug is a UUID (for backward compatibility)
 */
export function isUUID(str: string): boolean {
  if (!str) return false;
  
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
