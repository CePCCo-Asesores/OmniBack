import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './core/session';
import AuthCallback from './pages/AuthCallback';

// Páginas mínimas de ejemplo; cambia por tus componentes reales
function LoginPage() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const googleUrl = `${backendUrl}/auth/google`;
  return (
    <div style={{ padding: 24 }}>
      <h1>Iniciar sesión</h1>
      <a href={googleUrl}>Continuar con Google</a>
    </div>
  );
}

function DashboardPage() {
  return <div style={{ padding: 24 }}><h1>Dashboard</h1></div>;
}

function AdminPage() {
  return <div style={{ padding: 24 }}><h1>Admin</h1></div>;
}

function AgentPage() {
  return <div style={{ padding: 24 }}><h1>Agent</h1></div>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Privado */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route
          path="/agent"
          element={
            <RequireAuth>
              <AgentPage />
            </RequireAuth>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
