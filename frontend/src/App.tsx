import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { storeToken, getToken, getUserFromToken, isTokenExpired } from './core/session';
import { GoogleLoginButton } from './core/auth';
import DashboardUI from './ui/dashboard';
import AdminUI from './ui/admin';
import AgentUI from './ui/agent';
import AgentCoreModule from './modules/agent-core';
import AnalyticsModule from './modules/analytics';
import PermissionsModule from './modules/permissions';
import Layout from './ui/layout';

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (stored && !isTokenExpired(stored)) {
        setToken(stored);
        setUser(getUserFromToken(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return setLoading(false);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(profile => {
        setModules(profile.modules || []);
        setUser(profile.user || getUserFromToken(token));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  if (!token || isTokenExpired(token)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>OmniBack Login</h1>
        <GoogleLoginButton />
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user} modules={modules}>
        <Routes>
          <Route path="/" element={<DashboardUI user={user} />} />
          <Route path="/admin" element={<AdminUI user={user} />} />
          <Route path="/agent" element={<AgentUI user={user} />} />
          {modules.includes('agent-core') && (
            <Route path="/modules/agent-core" element={<AgentCoreModule />} />
          )}
          {modules.includes('analytics') && (
            <Route path="/modules/analytics" element={<AnalyticsModule />} />
          )}
          {modules.includes('permissions') && (
            <Route path="/modules/permissions" element={<PermissionsModule />} />
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
