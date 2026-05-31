import React, { useRef } from 'react';

/**
 * SearchBar component.
 * Props:
 *   value       – controlled input value
 *   onChange    – (value: string) => void
 *   placeholder – input placeholder text
 *   onClear     – optional callback when clear button is clicked
 */
const SearchBar = ({
    value = '',
    onChange,
    placeholder = 'Search food…',
    onClear,
}) => {
    const inputRef = useRef(null);

    const handleClear = () => {
        onChange?.('');
        onClear?.();
        inputRef.current?.focus();
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '999px',
                padding: '10px 16px',
                transition: 'border-color 120ms ease, box-shadow 120ms ease',
            }}
            onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent)';
            }}
            onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Search icon */}
            <svg
                width="18" height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    font: 'inherit',
                    fontSize: '1rem',
                    color: 'var(--color-text)',
                    minWidth: 0,
                }}
            />

            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        padding: '2px',
                        lineHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;
