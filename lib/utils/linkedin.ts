
export const getLinkedInSearchUrl = (jobTitle: string, companyName: string): string => {
  // We target decision makers (Recruiters and HR) at the specific company.
  // Using boolean operators (OR) and quotes for precise LinkedIn filtering.
  const query = encodeURIComponent(`(Recruiter OR "Talent Acquisition" OR "HR Manager") ${companyName}`);
  return `https://www.linkedin.com/search/results/people/?keywords=${query}`;
};
