export const getPermissions = async (token: string) => {
  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/modules/permissions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};
