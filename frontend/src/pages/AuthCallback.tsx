import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TOKEN_KEY = 'auth_token';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const redirect = params.get('redirect') || '/dashboard';

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      navigate(redirect, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate]);

  return <div style={{ padding: 24 }}>Procesando inicio de sesión…</div>;
}
