import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ user, modules, children }: any) => {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '200px', padding: '1rem', background: '#f0f0f0' }}>
        <h3>OmniBack</h3>
        <p>{user?.name}</p>
        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            {modules.includes('agent-core') && <li><Link to="/modules/agent-core">Agent Core</Link></li>}
            {modules.includes('analytics') && <li><Link to="/modules/analytics">Analytics</Link></li>}
            {modules.includes('permissions') && <li><Link to="/modules/permissions">Permissions</Link></li>}
            <li><Link to="/admin">Admin</Link></li>
            <li><Link to="/agent">Agent</Link></li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
};

export default Layout;
