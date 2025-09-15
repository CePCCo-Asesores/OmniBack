import React from 'react';
import { getGoogleLoginUrl } from '../api';

const DashboardUI = () => {
  const handleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard OmniBack</h1>
      <button onClick={handleLogin} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
        Iniciar sesión con Google
      </button>
    </div>
  );
};

export default DashboardUI;
