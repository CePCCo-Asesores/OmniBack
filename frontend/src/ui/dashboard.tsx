import React from 'react';
import { getGoogleLoginUrl } from '../api';
import { GoogleLoginButton } from '../core/auth';

const DashboardUI = ({ user }: { user?: Record<string, any> }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard OmniBack</h1>
      {!user ? (
        <GoogleLoginButton />
      ) : (
        <>
          <p>Sesión activa como: <strong>{user.email}</strong></p>
          <p>Nombre: {user.name}</p>
        </>
      )}
    </div>
  );
};

export default DashboardUI;
