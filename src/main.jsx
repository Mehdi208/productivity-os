import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';

// Global resilience: Catch background network dropouts or WebSocket timeouts so they never crash the UI
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (
    reasonStr.includes('network') || 
    reasonStr.includes('Firestore') || 
    reasonStr.includes('offline') || 
    reasonStr.includes('aborted') ||
    reasonStr.includes('timeout') ||
    reasonStr.includes('transport')
  ) {
    // Suppress transient network disconnections during phone sleep or idle
    event.preventDefault();
    console.info("Silently handled transient background network event:", reasonStr);
  }
});

// Self-Healing Error Boundary that preserves 100% of user data
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Productivity OS Error Boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRecover = () => {
    try {
      localStorage.removeItem('pos_active_focus_session');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handlePurgeAndReload = () => {
    try {
      const savedTheme = localStorage.getItem('pos_theme');
      const savedLang = localStorage.getItem('pos_lang');
      localStorage.removeItem('pos_active_focus_session');
      localStorage.removeItem('pos_custom_blocks_by_date');
      localStorage.removeItem('pos_checked_blocks');
      localStorage.removeItem('pos_week_blocks');
      if (savedTheme) localStorage.setItem('pos_theme', savedTheme);
      if (savedLang) localStorage.setItem('pos_lang', savedLang);
    } catch {}
    window.location.reload();
  };

  handleReload = () => {
    try {
      localStorage.removeItem('pos_active_focus_session');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: 24, 
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
          textAlign: 'center', 
          backgroundColor: '#0B0F19', 
          color: '#F8FAFC',
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ maxWidth: 460, width: '100%', backgroundColor: '#161E2E', padding: 28, borderRadius: 24, border: '1px solid #27354A', boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0' }}>Productivity OS — Reprise de session</h1>
            <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.5, margin: '0 0 20px 0' }}>
              L'application a détecté une anomalie d'affichage temporaire. Vos données et projets restent protégés et synchronisés.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <button 
                onClick={this.handleRecover}
                style={{ 
                  backgroundColor: '#6C63FF', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  padding: '10px 18px', 
                  borderRadius: 14, 
                  fontWeight: 700, 
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(108, 99, 255, 0.4)'
                }}
              >
                Reprendre ma session
              </button>
              <button 
                onClick={this.handleReload}
                style={{ 
                  backgroundColor: '#27354A', 
                  color: '#E2E8F0', 
                  border: 'none', 
                  padding: '10px 18px', 
                  borderRadius: 14, 
                  fontWeight: 600, 
                  fontSize: 13,
                  cursor: 'pointer' 
                }}
              >
                Rafraîchir
              </button>
              <button 
                onClick={this.handlePurgeAndReload}
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                  color: '#F87171', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  padding: '10px 16px', 
                  borderRadius: 14, 
                  fontWeight: 600, 
                  fontSize: 12,
                  cursor: 'pointer' 
                }}
              >
                Réparer le cache & Recharger
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: 20, textAlign: 'left', fontSize: 11, backgroundColor: '#0B0F19', padding: '10px 14px', borderRadius: 12, border: '1px solid #334155', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 700, color: '#94A3B8', outline: 'none' }}>
                  Détails techniques
                </summary>
                <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 10, color: '#F87171', fontFamily: 'monospace' }}>
                  {this.state.error?.message || String(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
