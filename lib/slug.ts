/**
 * Generate SEO-friendly slug from job title
 * Converts: "Senior Staff Machine Learning Engineer – GenAI"
 * To: "senior-staff-machine-learning-engineer-genai"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove trailing hyphen if substring cut mid-word
    .replace(/-+$/, '');
}

/**
 * Generate unique slug by appending counter if needed
 * Used when a slug already exists in the database
 */
export function generateUniqueSlug(baseSlug: string, counter: number = 1): string {
  if (counter === 1) return baseSlug;
  return `${baseSlug}-${counter}`;
}
