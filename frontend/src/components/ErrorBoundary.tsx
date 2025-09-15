import React from 'react';

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Aquí podrías enviar a un logger externo
    // console.error('React error boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Algo salió mal</h2>
          <p>Intenta recargar la página. Si persiste, contacta soporte.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
