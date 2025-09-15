import { resolveProfile } from '../../src/engine/resolver';
import fs from 'fs';
import path from 'path';

test('resolve profile from file', () => {
  const profilePath = path.join(__dirname, '../../src/engine/profiles/test.json');
  fs.writeFileSync(profilePath, JSON.stringify({ instanceId: 'test', modules: [], permissions: [] }));
  const profile = resolveProfile('test');
  expect(profile?.instanceId).toBe('test');
  fs.unlinkSync(profilePath);
});
