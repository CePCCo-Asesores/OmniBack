type UserRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const users: Record<string, UserRecord> = {};

export const getAllUsers = (): UserRecord[] => {
  return Object.values(users);
};

export const getUserByEmail = (email: string): UserRecord | null => {
  return Object.values(users).find(u => u.email === email) || null;
};
