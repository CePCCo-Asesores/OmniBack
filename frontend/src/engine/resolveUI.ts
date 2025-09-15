export const resolveUI = (instanceId: string): string => {
  const map: Record<string, string> = {
    omniback: 'dashboard',
    cepco: 'admin',
    agentnet: 'agent'
  };
  return map[instanceId] || 'default';
};
