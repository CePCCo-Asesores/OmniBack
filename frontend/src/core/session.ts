export const storeToken = (token: string) => {
  localStorage.setItem('omniback_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('omniback_token');
};

export const clearToken = () => {
  localStorage.removeItem('omniback_token');
};

export const getUserFromToken = (token: string): Record<string, any> | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
