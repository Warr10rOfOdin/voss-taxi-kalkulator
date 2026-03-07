/**
 * Keyboard Shortcuts Panel
 *
 * Displays available keyboard shortcuts and handles global shortcuts.
 * Press '?' to toggle the panel.
 */

import { useState, useEffect } from 'react';
import { KEYBOARD_SHORTCUTS } from '../../utils/constants';

export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'Ctrl+';
      if (shift) shortcut += 'Shift+';
      if (alt) shortcut += 'Alt+';
      shortcut += key;

      // Execute shortcut handler if exists
      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default function KeyboardShortcutsPanel({ translations }) {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts({
    '?': () => setIsOpen(prev => !prev),
    'Escape': () => setIsOpen(false)
  });

  const shortcuts = [
    { keys: ['Enter'], description: translations?.shortcutAdvanceField || 'Advance to next field' },
    { keys: ['Tab'], description: translations?.shortcutTab || 'Navigate between fields' },
    { keys: ['Esc'], description: translations?.shortcutEscape || 'Close modal/panel' },
    { keys: ['?'], description: translations?.shortcutHelp || 'Show this help' },
    { keys: ['Ctrl', 'P'], description: translations?.shortcutPrint || 'Print/PDF' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--bg-btn-secondary)',
          border: '1px solid var(--border-card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: 'var(--shadow-btn)',
          transition: 'all 0.2s ease',
          zIndex: 1000
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-btn-hover)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-btn)';
        }}
        aria-label="Show keyboard shortcuts"
      >
        ?
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-modal)',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            margin: 0
          }}>
            ⌨️ {translations?.keyboardShortcuts || 'Keyboard Shortcuts'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'var(--bg-input)',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-input-focus)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {shortcut.description}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={i}
                    style={{
                      padding: '4px 8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: 'var(--bg-input)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          💡 {translations?.shortcutTip || 'Press ? anytime to toggle this panel'}
        </div>
      </div>
    </div>
  );
}
