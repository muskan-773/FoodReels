import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { foodApi } from '../../services/api';
import '../../styles/user-profile.css';

function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

const GRAD = [
    'linear-gradient(135deg, #ff416c, #ff4b2b)',
    'linear-gradient(135deg, #f59e0b, #ea580c)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
];

function getGrad(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return GRAD[Math.abs(h) % GRAD.length];
}

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, foodPartner, isPartner, isLoggedIn, logout } = useAuth();
    const [savedVideos, setSavedVideos] = useState([]);
    const [partnerVideos, setPartnerVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        if (isPartner && foodPartner) {
            // Load partner's uploaded videos
            foodApi.getAll()
                .then(res => {
                    const myVideos = (res.data.foodItems || []).filter(
                        v => v.foodPartner?._id === foodPartner._id || v.foodPartner === foodPartner._id
                    );
                    setPartnerVideos(myVideos);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            // Load user's saved reels
            foodApi.getSaved()
                .then(savedRes => {
                    setSavedVideos(savedRes.data.savedFoods || []);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isLoggedIn, isPartner, foodPartner]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="up-loading"><div className="up-spinner" /></div>
        );
    }

    // Guest prompt if not logged in
    if (!isLoggedIn) {
        return (
            <div className="up-page" style={{ paddingTop: '80px', textAlign: 'center' }}>
                <div style={{
                    maxWidth: '480px',
                    margin: '40px auto',
                    padding: '32px 24px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)'
                }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>👋</span>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px' }}>Welcome to FoodReels</h1>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 24px', fontSize: '0.92rem' }}>
                        Sign in to like, save your favorite food reels, and get personalized AI recommendations.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link to="/user/login" className="up-empty-cta" style={{ display: 'block', textAlign: 'center' }}>
                            Sign In as Foodie
                        </Link>
                        <Link to="/food-partner/login" className="up-link-card" style={{ justifyContent: 'center' }}>
                            <span>🍴 Food Partner Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const accountName = isPartner ? foodPartner.name : user.fullName;
    const accountEmail = isPartner ? foodPartner.email : user.email;
    const grad = getGrad(accountName);
    const initials = getInitials(accountName);

    return (
        <div className="up-page" style={{ paddingTop: '76px' }}>

            {/* ── Header ── */}
            <div className="up-header">
                <div className="up-avatar" style={{ background: grad }}>
                    {initials}
                </div>
                <div className="up-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 className="up-name">{accountName}</h1>
                        {isPartner && (
                            <span className="badge-tag tag-cuisine">🍴 Restaurant Partner</span>
                        )}
                    </div>
                    <p className="up-email">{accountEmail}</p>
                    {isPartner && foodPartner.address && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                            📍 {foodPartner.address}
                        </p>
                    )}
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
                {isPartner ? (
                    <>
                        <div className="up-stat">
                            <span className="up-stat-value">{partnerVideos.length}</span>
                            <span className="up-stat-label">Uploaded Reels</span>
                        </div>
                        <div className="up-stat">
                            <span className="up-stat-value">
                                {partnerVideos.reduce((acc, v) => acc + (v.likeCount || 0), 0)}
                            </span>
                            <span className="up-stat-label">Total Likes</span>
                        </div>
                    </>
                ) : (
                    <div className="up-stat">
                        <span className="up-stat-value">{savedVideos.length}</span>
                        <span className="up-stat-label">Saved Reels</span>
                    </div>
                )}
            </div>

            {/* ── Quick links ── */}
            <div className="up-links">
                {isPartner && (
                    <Link to="/create-food" className="up-link-card" style={{ border: '1px solid #ff4757' }}>
                        <span className="up-link-icon">➕</span>
                        <span style={{ fontWeight: 700, color: '#ff4757' }}>Upload New Food Reel</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="up-link-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                )}
                <Link to="/" className="up-link-card">
                    <span className="up-link-icon">🔥</span>
                    <span>Home Reels Feed</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="up-link-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link to="/search" className="up-link-card">
                    <span className="up-link-icon">✨</span>
                    <span>AI Craving Sommelier</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="up-link-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
            </div>

            {/* ── Content Grid (Partner Uploads or User Saves) ── */}
            <section className="up-saved-section">
                <h2 className="up-section-title">
                    {isPartner ? "Your Uploaded Reels" : "Saved Reels"}
                </h2>

                {(isPartner ? partnerVideos : savedVideos).length === 0 ? (
                    <div className="up-empty">
                        <span>{isPartner ? "📹" : "🔖"}</span>
                        <p>{isPartner ? "You haven't uploaded any reels yet." : "Nothing saved yet."}</p>
                        <Link to={isPartner ? "/create-food" : "/"} className="up-empty-cta">
                            {isPartner ? "Create your first reel" : "Browse reels"}
                        </Link>
                    </div>
                ) : (
                    <div className="up-grid">
                        {(isPartner ? partnerVideos : savedVideos).map(v => (
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
                                    <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>❤️ {v.likeCount || 0}</span>
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
                            <div style={{ marginTop: '10px' }}>
                                <button
                                    className="up-empty-cta"
                                    onClick={() => navigate(`/?highlight=${activeVideo._id}`)}
                                >
                                    Open in Feed →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
