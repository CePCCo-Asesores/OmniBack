type License = {
  instanceId: string;
  type: 'free' | 'premium' | 'social';
  expiresAt: string;
};

const licenses: Record<string, License> = {};

export const assignLicense = (instanceId: string, type: License['type'], durationDays: number): License => {
  const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();
  const license: License = { instanceId, type, expiresAt };
  licenses[instanceId] = license;
  return license;
};

export const getLicense = (instanceId: string): License | null => {
  return licenses[instanceId] || null;
};
