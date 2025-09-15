export const validateEthics = (input: string): boolean => {
  const bannedTerms = ['violence', 'discrimination', 'fraud'];
  return !bannedTerms.some(term => input.toLowerCase().includes(term));
};
