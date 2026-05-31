import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/partner-profile.css';

function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}
const GRAD = [
    'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    'linear-gradient(135deg,#11998e,#38ef7d)',
    'linear-gradient(135deg,#fc4a1a,#f7b733)',
    'linear-gradient(135deg,#4776e6,#8e54e9)',
    'linear-gradient(135deg,#f953c6,#b91d73)',
    'linear-gradient(135deg,#43cea2,#185a9d)',
];
function getGrad(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return GRAD[Math.abs(h) % GRAD.length];
}

const PartnerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null); // lightbox

    useEffect(() => {
        axios.get(`http://localhost:3001/api/food-partner/${id}`, { withCredentials: true })
            .then(res => {
                setProfile(res.data.foodPartner);
                setVideos(res.data.foodPartner.foodItems || []);
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to load profile.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="pp-loading">
            <div className="pp-spinner" />
        </div>
    );

    if (error || !profile) return (
        <div className="pp-error">
            <p>{error || 'Profile not found.'}</p>
            <button onClick={() => navigate(-1)}>← Go back</button>
        </div>
    );

    const totalLikes  = videos.reduce((s, v) => s + (v.likeCount  ?? 0), 0);
    const totalSaves  = videos.reduce((s, v) => s + (v.savesCount ?? 0), 0);
    const grad        = getGrad(profile.name);
    const initials    = getInitials(profile.name);

    return (
        <div className="pp-page">

            {/* ── Back ── */}
            <button className="pp-back" onClick={() => navigate(-1)} aria-label="Go back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
            </button>

            {/* ── Hero banner ── */}
            <div className="pp-hero" style={{ background: grad }}>
                <div className="pp-hero-overlay" />
                <div className="pp-hero-content">
                    <div className="pp-avatar" style={{ background: grad }} aria-label={profile.name}>
                        {initials}
                    </div>
                    <div className="pp-hero-text">
                        <h1 className="pp-name">{profile.name}</h1>
                        <p className="pp-contact">by {profile.contactName}</p>
                    </div>
                </div>
            </div>

            {/* ── Info card ── */}
            <div className="pp-info-card">
                <div className="pp-info-row">
                    <span className="pp-info-icon">📍</span>
                    <span>{profile.address}</span>
                </div>
                {profile.phone && (
                    <div className="pp-info-row">
                        <span className="pp-info-icon">📞</span>
                        <a href={`tel:${profile.phone}`} className="pp-info-link">{profile.phone}</a>
                    </div>
                )}
                <div className="pp-info-row">
                    <span className="pp-info-icon">✉️</span>
                    <a href={`mailto:${profile.email}`} className="pp-info-link">{profile.email}</a>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="pp-stats">
                <div className="pp-stat">
                    <span className="pp-stat-value">{videos.length}</span>
                    <span className="pp-stat-label">Reels</span>
                </div>
                <div className="pp-stat-divider" />
                <div className="pp-stat">
                    <span className="pp-stat-value">{totalLikes}</span>
                    <span className="pp-stat-label">Likes</span>
                </div>
                <div className="pp-stat-divider" />
                <div className="pp-stat">
                    <span className="pp-stat-value">{totalSaves}</span>
                    <span className="pp-stat-label">Saves</span>
                </div>
            </div>

            {/* ── Video grid ── */}
            <section className="pp-grid-section">
                <h2 className="pp-grid-title">Food Reels</h2>
                {videos.length === 0 ? (
                    <div className="pp-empty">
                        <span>🍽️</span>
                        <p>No reels uploaded yet.</p>
                    </div>
                ) : (
                    <div className="pp-grid">
                        {videos.map(v => (
                            <button
                                key={v._id}
                                className="pp-grid-item"
                                onClick={() => setActiveVideo(v)}
                                aria-label={`Play ${v.name}`}
                            >
                                <video
                                    src={v.video}
                                    muted playsInline preload="metadata"
                                    className="pp-grid-video"
                                />
                                <div className="pp-grid-overlay">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </div>
                                <div className="pp-grid-meta">
                                    <span className="pp-grid-name">{v.name}</span>
                                    <span className="pp-grid-likes">❤️ {v.likeCount ?? 0}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Video lightbox ── */}
            {activeVideo && (
                <div className="pp-lightbox" onClick={() => setActiveVideo(null)} role="dialog" aria-modal="true">
                    <div className="pp-lightbox-inner" onClick={e => e.stopPropagation()}>
                        <button className="pp-lightbox-close" onClick={() => setActiveVideo(null)} aria-label="Close">✕</button>
                        <video
                            src={activeVideo.video}
                            controls autoPlay playsInline
                            className="pp-lightbox-video"
                        />
                        <div className="pp-lightbox-info">
                            <h3>{activeVideo.name}</h3>
                            {activeVideo.description && <p>{activeVideo.description}</p>}
                            <div className="pp-lightbox-stats">
                                <span>❤️ {activeVideo.likeCount ?? 0} likes</span>
                                <span>🔖 {activeVideo.savesCount ?? 0} saves</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerProfile;
