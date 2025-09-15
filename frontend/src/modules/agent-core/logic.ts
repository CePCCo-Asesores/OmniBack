export const getAgentData = async (token: string) => {
  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/modules/agent-core`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};
