import jwt from 'jsonwebtoken';
import { insert } from '../db/client';

export const createToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const verifyToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};

export const logSession = async (userId: string, instanceId: string) => {
  await insert('sessions', { user_id: userId, instance_id: instanceId });
};
