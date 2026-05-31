import React, { useRef, useState } from 'react';

/**
 * VideoCard — compact thumbnail card for grid layouts (e.g. Profile page).
 * Props:
 *   video       – video URL
 *   name        – food name
 *   likeCount   – number of likes
 *   savesCount  – number of saves
 *   onClick     – optional click handler
 */
const VideoCard = ({ video, name, likeCount = 0, savesCount = 0, onClick }) => {
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
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                background: '#111',
            }}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
            aria-label={name}
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
                }}
            />

            {/* Overlay on hover */}
            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '10px',
                        gap: '4px',
                    }}
                    aria-hidden="true"
                >
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '.85rem', margin: 0, lineHeight: 1.2 }}>
                        {name}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', color: 'rgba(255,255,255,.8)', fontSize: '.75rem' }}>
                        <span>❤️ {likeCount}</span>
                        <span>🔖 {savesCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCard;
