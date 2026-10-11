import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

const EmptyState = ({
    icon = null,
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
                padding: '64px 24px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
            }}
            role="status"
            aria-label={title}
        >
            <div
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent-gold)',
                    marginBottom: '4px'
                }}
            >
                {icon ? (
                    typeof icon === 'string' ? <span style={{ fontSize: '1.6rem' }}>{icon}</span> : icon
                ) : (
                    <UtensilsCrossed size={24} strokeWidth={1.8} />
                )}
            </div>

            <h2 className="font-editorial" style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                {title}
            </h2>
            {message && (
                <p style={{ fontSize: '0.88rem', maxWidth: '340px', lineHeight: 1.5, margin: 0, color: 'var(--color-text-secondary)' }}>
                    {message}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="btn-editorial btn-editorial--secondary"
                    style={{ marginTop: '8px' }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
