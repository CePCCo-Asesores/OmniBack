type UserRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const users: Record<string, UserRecord> = {};

export const registerUser = (id: string, email: string, name: string): UserRecord => {
  if (!users[id]) {
    users[id] = {
      id,
      email,
      name,
      createdAt: new Date().toISOString()
    };
  }
  return users[id];
};

export const getUser = (id: string): UserRecord | null => {
  return users[id] || null;
};
