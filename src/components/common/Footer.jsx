/**
 * Footer Component
 *
 * Displays branding, "Powered by Drivas Fleet", and optional links.
 */

export default function Footer({ tenant, translations }) {
  const showPoweredBy = tenant?.features?.showPoweredBy !== false;
  const poweredByText = tenant?.branding?.poweredBy?.[translations?.lang || 'no'] ||
                       tenant?.branding?.poweredBy?.no ||
                       'Powered by Drivas Fleet';

  return (
    <footer
      style={{
        marginTop: 'auto',
        padding: '24px 20px',
        textAlign: 'center',
        color: 'var(--text-footer)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-row-faint)'
      }}
    >
      {showPoweredBy && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px',
          opacity: 0.8,
          transition: 'opacity 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ opacity: 0.7 }}
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>{poweredByText}</span>
        </div>
      )}

      {tenant?.contact?.website && (
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>
          <a
            href={tenant.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              borderBottom: '1px dotted currentColor',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            {tenant.contact.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}
    </footer>
  );
}
