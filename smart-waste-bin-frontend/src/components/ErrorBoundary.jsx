import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          flexDirection: 'column',
          gap: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '2.5rem' }}>{this.props.icon || '⚠️'}</span>
          <h3 style={{ margin: 0, color: '#e8eaf6', fontSize: '1.1rem' }}>
            {this.props.title || 'Something went wrong'}
          </h3>
          <p style={{ margin: 0, color: '#8892b0', fontSize: '0.875rem', maxWidth: '360px' }}>
            {this.props.message || this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.props.showRetry !== false && (
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: '8px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: '1px solid #00d4aa',
                background: 'transparent',
                color: '#00d4aa',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.background = '#00d4aa'; e.target.style.color = '#0a0e17'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#00d4aa'; }}
            >
              Retry
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
