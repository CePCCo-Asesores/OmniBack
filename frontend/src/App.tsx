import React from 'react';
import { resolveUI } from './engine/resolveUI';
import DashboardUI from './ui/dashboard';
import AdminUI from './ui/admin';
import AgentUI from './ui/agent';

const instanceId = process.env.REACT_APP_INSTANCE_ID || 'default';
const activeUI = resolveUI(instanceId);

const App = () => {
  switch (activeUI) {
    case 'dashboard': return <DashboardUI />;
    case 'admin': return <AdminUI />;
    case 'agent': return <AgentUI />;
    default: return <div>UI no definida para instancia: {instanceId}</div>;
  }
};

export default App;

