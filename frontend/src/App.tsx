import React, { useEffect, useState } from 'react';
import { storeToken, getToken, getUserFromToken } from './core/session';
import { GoogleLoginButton } from './core/auth';
import { resolveUI } from './engine/resolveUI';
import DashboardUI from './ui/dashboard';
import AdminUI from './ui/admin';
import AgentUI from './ui/agent';
import AgentCoreModule from './modules/agent-core';
import AnalyticsModule from './modules/analytics';
import PermissionsModule from './modules/permissions';

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [activeUI, setActiveUI] = useState<string>('dashboard');
  const [modules, setModules] = useState<string[]>([]);

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

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(profile => {
        setActiveUI(profile.activeUI || resolveUI(profile.instance));
        setModules(profile.modules || []);
        setUser(profile.user || getUserFromToken(token));
      })
      .catch(() => {
        setActiveUI('dashboard');
      });
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>OmniBack Login</h1>
        <GoogleLoginButton />
      </div>
    );
  }

  if (activeUI === 'dashboard') {
    return <DashboardUI user={user} />;
  }

  if (activeUI === 'admin') {
    return <AdminUI user={user} />;
  }

  if (activeUI === 'agent') {
    return <AgentUI user={user} />;
  }

  // Activación de módulos visuales
  if (modules.includes('agent-core')) return <AgentCoreModule />;
  if (modules.includes('analytics')) return <AnalyticsModule />;
  if (modules.includes('permissions')) return <PermissionsModule />;

  return <div>Interfaz no definida para esta instancia.</div>;
};

export default App;
