import React, { useRef, useState } from 'react';
import { Heart, Bookmark, Play } from 'lucide-react';

/**
 * VideoCard — Refined editorial thumbnail card for grid layouts
 */
const VideoCard = ({ video, name, cuisine, price, likeCount = 0, savesCount = 0, onClick }) => {
    const videoRef = useRef(null);
    const [hovered, setHovered] = useState(false);

    const handleMouseEnter = () => {
        setHovered(true);
        videoRef.current?.play().catch(() => {});
    };

    const handleMouseLeave = () => {
        setHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className="video-card"
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'relative',
                aspectRatio: '3/4',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                transition: 'all var(--transition-smooth)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
            }}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
            aria-label={`View ${name}`}
        >
            <video
                ref={videoRef}
                src={video}
                muted
                playsInline
                loop
                preload="metadata"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 300ms ease',
                    transform: hovered ? 'scale(1.04)' : 'scale(1)'
                }}
            />

            {/* Always visible subtle bottom gradient for title clarity */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(12, 14, 18, 0.92) 0%, rgba(12, 14, 18, 0.4) 35%, transparent 65%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '12px 14px',
                    gap: '4px',
                    pointerEvents: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <p style={{
                        color: '#fff',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        margin: 0,
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {name}
                    </p>
                    {price > 0 && (
                        <span style={{
                            color: 'var(--color-accent-gold)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            fontVariantNumeric: 'tabular-nums'
                        }}>
                            ${price}
                        </span>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.72rem',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>
                        {cuisine || 'Featured'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Heart size={11} strokeWidth={2.2} fill={likeCount > 0 ? "rgba(255,255,255,0.7)" : "none"} />
                            {likeCount}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Bookmark size={11} strokeWidth={2.2} />
                            {savesCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Hover Play Indicator */}
            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(12, 14, 18, 0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    aria-hidden="true"
                >
                    <Play size={13} fill="white" strokeWidth={0} style={{ marginLeft: '2px' }} />
                </div>
            )}
        </div>
    );
};

export default VideoCard;
