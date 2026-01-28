
export const formatSalary = (range: string | null): string => {
  if (!range) return 'Competitive';
  return range;
};

/**
 * Formats a date to a relative string (e.g., "5m ago").
 * Note: When using with SSR, this can cause hydration mismatches.
 * We use suppressHydrationWarning and delay this until client-mount.
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  
  return date.toISOString().split('T')[0];
};

/**
 * Returns a stable date string (YYYY-MM-DD) that is independent of locale.
 * Essential for preventing SSR/Client hydration mismatches.
 */
export const formatAbsoluteDate = (dateString: string): string => {
  const date = new Date(dateString);
  // ISO strings are stable across all environments
  return date.toISOString().split('T')[0];
};
