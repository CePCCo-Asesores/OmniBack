import fs from 'fs';
import path from 'path';

export const logAction = (instanceId: string, action: string, metadata?: Record<string, any>) => {
  const logPath = path.join(__dirname, '../../instances', instanceId, 'trace.log');
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    metadata: metadata || {}
  };
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
};
