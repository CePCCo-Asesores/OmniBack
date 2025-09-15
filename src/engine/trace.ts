import fs from 'fs';
import path from 'path';

export const traceActivation = (instanceId: string, action: string) => {
  const logPath = path.join(__dirname, '../../instances', instanceId, 'trace.log');
  const entry = `[${new Date().toISOString()}] ${action}\n`;
  fs.appendFileSync(logPath, entry);
};
