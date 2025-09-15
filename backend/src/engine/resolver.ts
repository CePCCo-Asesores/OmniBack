import fs from 'fs';
import path from 'path';

type Profile = {
  instanceId: string;
  modules: string[];
  permissions: string[];
};

export const resolveProfile = (instanceId: string): Profile | null => {
  const profilePath = path.join(__dirname, 'profiles', `${instanceId}.json`);
  if (!fs.existsSync(profilePath)) return null;

  const raw = fs.readFileSync(profilePath, 'utf-8');
  const profile = JSON.parse(raw) as Profile;
  return profile;
};
