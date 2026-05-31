import React from 'react';

/**
 * EmptyState component for when a list has no items.
 * Props:
 *   icon    – optional emoji or JSX icon
 *   title   – main heading
 *   message – supporting text
 *   action  – optional { label, onClick } for a CTA button
 */
const EmptyState = ({
    icon = '🍽️',
    title = 'Nothing here yet',
    message = '',
    action = null,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '60px 24px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
            }}
            role="status"
            aria-label={title}
        >
            {icon && (
                <span style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden="true">
                    {icon}
                </span>
            )}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                {title}
            </h2>
            {message && (
                <p style={{ fontSize: '.9rem', maxWidth: '280px', lineHeight: 1.5, margin: 0 }}>
                    {message}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    style={{
                        marginTop: '8px',
                        background: 'var(--color-accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '10px 20px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '.9rem',
                    }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
