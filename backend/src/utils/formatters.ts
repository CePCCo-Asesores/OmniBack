export const formatTimestamp = (date: Date): string => {
  return date.toISOString();
};

export const formatUserDisplay = (name: string, email: string): string => {
  return `${name} <${email}>`;
};
