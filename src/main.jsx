import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#090b10',
          color: '#f4f4f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Sam Elite</h2>
          <p style={{ color: '#a1a1aa', fontSize: '14px', maxWidth: '400px', marginBottom: '20px' }}>
            A temporary issue occurred while loading. Click below to reload.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reload Sam Elite
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
