import React, { useEffect, useState } from 'react';
import { resolveUI } from './engine/resolveUI';
import { storeToken, getToken, getUserFromToken } from './core/session';
import DashboardUI from './ui/dashboard';
import AdminUI from './ui/admin';
import AgentUI from './ui/agent';

const instanceId = process.env.REACT_APP_INSTANCE_ID || 'default';
const activeUI = resolveUI(instanceId);

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      storeToken(tokenFromUrl);
      setToken(tokenFromUrl);
      setUser(getUserFromToken(tokenFromUrl));
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const stored = getToken();
      if (stored) {
        setToken(stored);
        setUser(getUserFromToken(stored));
      }
    }
  }, []);

  if (!token) {
    return <DashboardUI />;
  }

  switch (activeUI) {
    case 'dashboard': return <DashboardUI user={user} />;
    case 'admin': return <AdminUI user={user} />;
    case 'agent': return <AgentUI user={user} />;
    default: return <div>UI no definida</div>;
  }
};

export default App;
