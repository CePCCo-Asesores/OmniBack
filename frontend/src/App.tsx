import React from 'react';
import AgentCoreModule from './modules/agent-core';
import AnalyticsModule from './modules/analytics';
import PermissionsModule from './modules/permissions';

const activeModule = process.env.REACT_APP_ACTIVE_MODULE || 'agent-core';

const App = () => {
  switch (activeModule) {
    case 'agent-core': return <AgentCoreModule />;
    case 'analytics': return <AnalyticsModule />;
    case 'permissions': return <PermissionsModule />;
    default: return <div>Módulo no definido</div>;
  }
};

export default App;
