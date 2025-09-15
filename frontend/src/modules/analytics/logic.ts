export const getAnalyticsData = async (token: string) => {
  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/modules/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};
