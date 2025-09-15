import fs from 'fs';
import path from 'path';

export const replicateInstance = (sourceId: string, targetId: string): boolean => {
  const sourcePath = path.join(__dirname, '../../instances', sourceId);
  const targetPath = path.join(__dirname, '../../instances', targetId);

  if (!fs.existsSync(sourcePath)) return false;
  fs.mkdirSync(targetPath, { recursive: true });

  const files = fs.readdirSync(sourcePath);
  files.forEach(file => {
    const content = fs.readFileSync(path.join(sourcePath, file));
    fs.writeFileSync(path.join(targetPath, file), content);
  });

  return true;
};
