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
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
