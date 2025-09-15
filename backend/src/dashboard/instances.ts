import fs from 'fs';
import path from 'path';

export const listInstances = (): string[] => {
  const instancesPath = path.join(__dirname, '../../instances');
  if (!fs.existsSync(instancesPath)) return [];
  return fs.readdirSync(instancesPath).filter(name => {
    const configPath = path.join(instancesPath, name, 'config.json');
    return fs.existsSync(configPath);
  });
};
