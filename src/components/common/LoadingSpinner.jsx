/**
 * Loading Spinner Component
 *
 * Reusable loading indicator with size variants and optional text.
 */

export default function LoadingSpinner({ size = 'medium', text, fullScreen = false }) {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizes[size] || sizes.medium;

  const spinner = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid var(--bg-input)',
          borderTop: '3px solid var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
        aria-label="Loading"
        role="status"
      />
      {text && (
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          {text}
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
