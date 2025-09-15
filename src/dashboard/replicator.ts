import { replicateInstance } from '../defense/replicator';

export const cloneInstance = (sourceId: string, targetId: string): boolean => {
  return replicateInstance(sourceId, targetId);
};
