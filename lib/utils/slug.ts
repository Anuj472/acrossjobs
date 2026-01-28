
export const generateSlug = (title: string, companyName: string, city: string): string => {
  const base = `${title}-${companyName}-${city}`.toLowerCase();
  return base
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/\s+/g, '-')     // replace spaces with hyphens
    .replace(/-+/g, '-')      // replace multiple hyphens with single one
    .trim();
};
