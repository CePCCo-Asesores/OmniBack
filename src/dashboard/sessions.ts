type SessionRecord = {
  userId: string;
  instanceId: string;
  timestamp: string;
};

const sessions: SessionRecord[] = [];

export const logSession = (userId: string, instanceId: string) => {
  sessions.push({
    userId,
    instanceId,
    timestamp: new Date().toISOString()
  });
};

export const getSessionsByUser = (userId: string): SessionRecord[] => {
  return sessions.filter(s => s.userId === userId);
};
