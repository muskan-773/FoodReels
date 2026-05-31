import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/user-profile.css';

const api = axios.create({ baseURL: 'http://localhost:3001', withCredentials: true });

function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}
const GRAD = [
    'linear-gradient(135deg,#4776e6,#8e54e9)',
    'linear-gradient(135deg,#11998e,#38ef7d)',
    'linear-gradient(135deg,#f953c6,#b91d73)',
    'linear-gradient(135deg,#fc4a1a,#f7b733)',
    'linear-gradient(135deg,#43cea2,#185a9d)',
];
function getGrad(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return GRAD[Math.abs(h) % GRAD.length];
}

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [savedVideos, setSavedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/api/auth/user/me'),
            api.get('/api/food/save'),
        ])
            .then(([userRes, savedRes]) => {
                setUser(userRes.data.user);
                const foods = (savedRes.data.savedFoods || []).map(s => s.food).filter(Boolean);
                setSavedVideos(foods);
            })
            .catch(() => {
                // not logged in
                navigate('/user/login');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = async () => {
        await api.get('/api/auth/user/logout').catch(() => {});
        navigate('/user/login');
    };

    if (loading) return (
        <div className="up-loading"><div className="up-spinner" /></div>
    );

    if (!user) return null;

    const grad     = getGrad(user.fullName);
    const initials = getInitials(user.fullName);

    return (
        <div className="up-page">

            {/* ── Header ── */}
            <div className="up-header">
                <div className="up-avatar" style={{ background: grad }}>
                    {initials}
                </div>
                <div className="up-info">
                    <h1 className="up-name">{user.fullName}</h1>
                    <p className="up-email">{user.email}</p>
                </div>
                <button className="up-logout-btn" onClick={handleLogout} aria-label="Log out">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="up-stats">
                <div className="up-stat">
                    <span className="up-stat-value">{savedVideos.length}</span>
                    <span className="up-stat-label">Saved</span>
                </div>
            </div>

            {/* ── Quick links ── */}
            <div className="up-links">
                <Link to="/" className="up-link-card">
                    <span className="up-link-icon">🏠</span>
                    <span>Home Feed</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="up-link-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link to="/saved" className="up-link-card">
                    <span className="up-link-icon">🔖</span>
                    <span>Saved Reels</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="up-link-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link to="/search" className="up-link-card">
                    <span className="up-link-icon">🔍</span>
                    <span>Discover Food</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="up-link-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
            </div>

            {/* ── Saved videos grid ── */}
            <section className="up-saved-section">
                <h2 className="up-section-title">Saved Reels</h2>
                {savedVideos.length === 0 ? (
                    <div className="up-empty">
                        <span>🔖</span>
                        <p>Nothing saved yet.</p>
                        <Link to="/" className="up-empty-cta">Browse reels</Link>
                    </div>
                ) : (
                    <div className="up-grid">
                        {savedVideos.map(v => (
                            <button
                                key={v._id}
                                className="up-grid-item"
                                onClick={() => setActiveVideo(v)}
                                aria-label={`Play ${v.name}`}
                            >
                                <video src={v.video} muted playsInline preload="metadata" className="up-grid-video" />
                                <div className="up-grid-overlay">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                </div>
                                <div className="up-grid-meta">
                                    <span className="up-grid-name">{v.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Lightbox ── */}
            {activeVideo && (
                <div className="up-lightbox" onClick={() => setActiveVideo(null)} role="dialog" aria-modal="true">
                    <div className="up-lightbox-inner" onClick={e => e.stopPropagation()}>
                        <button className="up-lightbox-close" onClick={() => setActiveVideo(null)}>✕</button>
                        <video src={activeVideo.video} controls autoPlay playsInline className="up-lightbox-video" />
                        <div className="up-lightbox-info">
                            <h3>{activeVideo.name}</h3>
                            {activeVideo.description && <p>{activeVideo.description}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
