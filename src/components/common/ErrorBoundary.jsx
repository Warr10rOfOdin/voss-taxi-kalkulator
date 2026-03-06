/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components, logs them,
 * and displays a fallback UI instead of crashing the whole app.
 */

import { Component } from 'react';
import { reportError } from '../../utils/errors';
import { logger } from '../../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    logger.error('[ErrorBoundary]', 'Caught error:', error, errorInfo);

    // Report to error tracking service
    reportError(error, {
      componentStack: errorInfo.componentStack,
      boundary: this.props.name || 'Unnamed'
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            errorInfo: this.state.errorInfo,
            reset: this.handleReset
          });
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-card)',
          margin: '20px'
        }}>
          <h2 style={{ color: 'var(--brand-danger)', marginBottom: '16px' }}>
            {this.props.title || 'Oops! Something went wrong'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {this.props.message || 'We\'re sorry for the inconvenience. The error has been logged.'}
          </p>

          {!import.meta.env.PROD && this.state.error && (
            <details style={{
              textAlign: 'left',
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(231, 76, 60, 0.1)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
