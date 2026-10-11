import React, { useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

const SearchBar = ({
    value = '',
    onChange,
    placeholder = 'Search dishes, cuisines, or restaurants…',
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
                gap: '10px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '11px 18px',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)'
            }}
            onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.background = 'var(--color-surface-elevated)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(226, 80, 55, 0.15)';
            }}
            onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'var(--color-surface)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <SearchIcon
                size={18}
                strokeWidth={2}
                color="var(--color-text-muted)"
                style={{ flexShrink: 0 }}
                aria-hidden="true"
            />

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
                    fontSize: '0.92rem',
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
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        flexShrink: 0,
                    }}
                >
                    <X size={13} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
