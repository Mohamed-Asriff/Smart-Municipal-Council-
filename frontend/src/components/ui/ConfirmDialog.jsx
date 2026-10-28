import React, { useEffect, useRef } from 'react';
import { Trash2, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog – A professional, accessible confirmation popup.
 *
 * Props:
 *   isOpen       {boolean}  – controls visibility
 *   onConfirm    {function} – called when user clicks the confirm button
 *   onCancel     {function} – called when user clicks cancel or backdrop
 *   title        {string}   – dialog heading
 *   message      {string}   – supporting message / description
 *   confirmLabel {string}   – label for confirm button (default: "Confirm")
 *   cancelLabel  {string}   – label for cancel button (default: "Cancel")
 *   variant      {string}   – "danger" | "warning" | "success" | "info" (default: "danger")
 *   isLoading    {boolean}  – show loading spinner on confirm button
 */
export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstFocusable = dialogRef.current.querySelector('button');
      firstFocusable?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: <Trash2 size={26} />,
      iconBg: 'rgba(239,68,68,0.12)',
      iconColor: '#ef4444',
      confirmBg: 'linear-gradient(135deg,#ef4444,#dc2626)',
      confirmShadow: '0 4px 16px rgba(239,68,68,0.35)',
      accentBorder: '#ef444430',
    },
    warning: {
      icon: <AlertTriangle size={26} />,
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
      confirmBg: 'linear-gradient(135deg,#f59e0b,#d97706)',
      confirmShadow: '0 4px 16px rgba(245,158,11,0.35)',
      accentBorder: '#f59e0b30',
    },
    success: {
      icon: <CheckCircle size={26} />,
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
      confirmBg: 'linear-gradient(135deg,#10b981,#059669)',
      confirmShadow: '0 4px 16px rgba(16,185,129,0.35)',
      accentBorder: '#10b98130',
    },
    info: {
      icon: <Info size={26} />,
      iconBg: 'rgba(99,102,241,0.12)',
      iconColor: '#6366f1',
      confirmBg: 'linear-gradient(135deg,#6366f1,#4f46e5)',
      confirmShadow: '0 4px 16px rgba(99,102,241,0.35)',
      accentBorder: '#6366f130',
    },
  };

  const cfg = variantConfig[variant] || variantConfig.danger;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 9998,
          animation: 'cdFadeIn 0.18s ease',
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cd-title"
        aria-describedby="cd-message"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 9999,
          width: '100%',
          maxWidth: 440,
          padding: '0 16px',
          animation: 'cdSlideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg,#1a2335,#151e2e)',
            border: `1px solid ${cfg.accentBorder}`,
            borderRadius: 16,
            padding: '32px 28px 24px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 2,
            background: cfg.confirmBg,
            borderRadius: '0 0 8px 8px',
            opacity: 0.7,
          }} />

          {/* Close button */}
          <button
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: 14, right: 14,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#8892a4',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#c8d0dc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#8892a4'; }}
          >
            <X size={15} />
          </button>

          {/* Icon circle */}
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: cfg.iconBg,
            border: `1px solid ${cfg.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: cfg.iconColor,
            marginBottom: 20,
          }}>
            {cfg.icon}
          </div>

          {/* Title */}
          <h2
            id="cd-title"
            style={{
              margin: '0 0 10px',
              fontSize: 18,
              fontWeight: 700,
              color: '#e8edf5',
              letterSpacing: '-0.3px',
            }}
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="cd-message"
            style={{
              margin: '0 0 28px',
              fontSize: 14,
              color: '#8892a4',
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#c8d0dc',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#c8d0dc'; }}
            >
              {cancelLabel}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 10,
                border: 'none',
                background: cfg.confirmBg,
                boxShadow: cfg.confirmShadow,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    width: 15, height: 15,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'cdSpin 0.7s linear infinite',
                  }} />
                  Processing…
                </>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cdFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes cdSlideUp {
          from { opacity:0; transform:translate(-50%,-46%) scale(0.92) }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1)   }
        }
        @keyframes cdSpin { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}
