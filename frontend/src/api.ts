export const getGoogleLoginUrl = (): string => {
  return `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
};
