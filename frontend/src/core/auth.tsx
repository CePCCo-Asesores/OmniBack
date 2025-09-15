import React from 'react';
import { getGoogleLoginUrl } from '../api';

export const GoogleLoginButton = () => (
  <button onClick={() => window.location.href = getGoogleLoginUrl()} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
    Iniciar sesión con Google
  </button>
);
