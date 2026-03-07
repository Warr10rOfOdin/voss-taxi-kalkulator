/**
 * Enhanced Info Tooltip Component
 *
 * Provides contextual help with better styling and accessibility.
 * Features:
 * - Hover and focus support
 * - Mobile-friendly (tap to toggle)
 * - Keyboard accessible
 * - Multiple positions
 * - Rich content support
 */

import { useState, useRef, useEffect } from 'react';

export default function InfoTooltip({
  content,
  position = 'top',
  size = 'medium',
  icon = '?',
  ariaLabel
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Click outside to close on mobile
    if (!isMobile || !isVisible) return;

    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isVisible]);

  const handleToggle = () => {
    if (isMobile) {
      setIsVisible(!isVisible);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    if (!isMobile) setIsVisible(false);
  };

  const sizes = {
    small: { icon: '16px', tooltip: '200px' },
    medium: { icon: '18px', tooltip: '260px' },
    large: { icon: '20px', tooltip: '320px' }
  };

  const currentSize = sizes[size] || sizes.medium;

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' }
  };

  const arrowPositions = {
    top: { bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
    bottom: { top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
    left: { right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' },
    right: { left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={ariaLabel || 'Show help'}
        aria-expanded={isVisible}
        style={{
          width: currentSize.icon,
          height: currentSize.icon,
          borderRadius: '50%',
          border: '1.5px solid var(--brand-primary)',
          background: 'transparent',
          color: 'var(--brand-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: 0,
          transition: 'all 0.2s ease',
          lineHeight: '1'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--brand-primary)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--brand-primary)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {icon}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'absolute',
            ...positions[position],
            width: currentSize.tooltip,
            background: 'var(--bg-tooltip)',
            color: 'var(--text-tooltip)',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            pointerEvents: isMobile ? 'auto' : 'none',
            animation: 'tooltipFadeIn 0.2s ease-out',
            border: '1px solid var(--border-card)'
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              ...arrowPositions[position],
              width: '8px',
              height: '8px',
              background: 'var(--bg-tooltip)',
              border: '1px solid var(--border-card)',
              borderRight: 'none',
              borderBottom: 'none'
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {content}
          </div>
        </div>
      )}

      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: ${positions[position].transform} scale(0.95);
          }
          to {
            opacity: 1;
            transform: ${positions[position].transform} scale(1);
          }
        }
      `}</style>
    </div>
  );
}
