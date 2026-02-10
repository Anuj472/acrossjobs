export interface JobStatus {
  isExpired: boolean;
  expiryDate?: Date;
  daysUntilExpiry?: number;
}

/**
 * Determines if a job is expired based on its posted date
 * Jobs are considered expired after 60 days
 */
export function getJobStatus(postedDate: string | Date): JobStatus {
  const posted = typeof postedDate === 'string' ? new Date(postedDate) : postedDate;
  const now = new Date();
  const daysSincePosted = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  const expiryDays = 60; // Jobs expire after 60 days
  
  return {
    isExpired: daysSincePosted > expiryDays,
    expiryDate: new Date(posted.getTime() + (expiryDays * 24 * 60 * 60 * 1000)),
    daysUntilExpiry: expiryDays - daysSincePosted
  };
}

/**
 * Returns the appropriate HTTP status code for a job
 * - 410 for expired jobs (Gone)
 * - 200 for active jobs
 */
export function getJobHttpStatus(postedDate: string | Date): number {
  const status = getJobStatus(postedDate);
  return status.isExpired ? 410 : 200;
}
