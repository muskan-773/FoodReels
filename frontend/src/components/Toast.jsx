import React, { useEffect } from 'react';
import '../styles/toast.css';

/**
 * Toast notification component.
 * Props:
 *   message  – string to display
 *   type     – 'success' | 'error' | 'info'  (default: 'info')
 *   duration – ms before auto-dismiss (default: 3000)
 *   onClose  – callback when dismissed
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => onClose?.(), duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const icons = {
        success: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        error: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
        info: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
    };

    return (
        <div className={`toast toast--${type}`} role="alert" aria-live="assertive">
            <span className="toast__icon">{icons[type] ?? icons.info}</span>
            <span className="toast__message">{message}</span>
            <button className="toast__close" onClick={onClose} aria-label="Dismiss notification">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
