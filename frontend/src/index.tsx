// frontend/src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// (Opcional) estilos globales si usas CSS
// import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento #root en el DOM');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// (Opcional) si usas reportWebVitals o service worker, colócalos aquí.
// reportWebVitals();
