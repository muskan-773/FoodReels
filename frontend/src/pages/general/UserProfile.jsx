import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Flame, Sparkles, Plus, Store, LogOut, Play, MapPin, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { foodApi } from '../../services/api';
import '../../styles/user-profile.css';

function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
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
            <div className="up-page" style={{ textAlign: 'center' }}>
                <div style={{
                    maxWidth: '460px',
                    margin: '40px auto',
                    padding: '40px 28px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <h1 className="font-editorial" style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px', color: '#fff' }}>
                        Welcome to FoodReels
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 28px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Sign in to save your favorite dishes, customize dietary cravings, and discover culinary reels.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link to="/user/login" className="btn-editorial btn-editorial--primary" style={{ width: '100%' }}>
                            Sign In as Foodie
                        </Link>
                        <Link to="/food-partner/login" className="btn-editorial btn-editorial--secondary" style={{ width: '100%' }}>
                            <Store size={15} />
                            <span>Restaurant Partner Portal</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const accountName = isPartner ? foodPartner.name : user.fullName;
    const accountEmail = isPartner ? foodPartner.email : user.email;
    const initials = getInitials(accountName);

    return (
        <div className="up-page">

            {/* ── Header ── */}
            <div className="up-header">
                <div className="up-avatar">
                    {initials}
                </div>
                <div className="up-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h1 className="up-name">{accountName}</h1>
                        {isPartner ? (
                            <span className="badge-pill badge-pill--gold">Partner Kitchen</span>
                        ) : (
                            <span className="badge-pill">Foodie Member</span>
                        )}
                    </div>
                    <p className="up-email">{accountEmail}</p>
                    {isPartner && foodPartner.address && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            <span>{foodPartner.address}</span>
                        </p>
                    )}
                </div>
                <button className="up-logout-btn" onClick={handleLogout} aria-label="Log out">
                    <LogOut size={14} />
                    <span>Log out</span>
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="up-stats">
                {isPartner ? (
                    <>
                        <div className="up-stat">
                            <span className="up-stat-value">{partnerVideos.length}</span>
                            <span className="up-stat-label">Published Reels</span>
                        </div>
                        <div className="up-stat">
                            <span className="up-stat-value">
                                {partnerVideos.reduce((acc, v) => acc + (v.likeCount || 0), 0)}
                            </span>
                            <span className="up-stat-label">Total Likes</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="up-stat">
                            <span className="up-stat-value">{savedVideos.length}</span>
                            <span className="up-stat-label">Saved Dishes</span>
                        </div>
                        <div className="up-stat">
                            <span className="up-stat-value">Active</span>
                            <span className="up-stat-label">Taste Profile</span>
                        </div>
                    </>
                )}
            </div>

            {/* ── Quick Links ── */}
            <div className="up-links">
                {isPartner && (
                    <Link to="/create-food" className="up-link-card" style={{ border: '1px solid var(--color-primary-border)' }}>
                        <span className="up-link-icon" style={{ color: 'var(--color-primary)' }}><Plus size={18} /></span>
                        <span style={{ fontWeight: 700, color: '#ff7862' }}>Publish New Reel</span>
                    </Link>
                )}
                <Link to="/" className="up-link-card">
                    <span className="up-link-icon"><Flame size={18} /></span>
                    <span>The Food Feed</span>
                </Link>
                <Link to="/search" className="up-link-card">
                    <span className="up-link-icon"><Sparkles size={18} /></span>
                    <span>AI Craving Sommelier</span>
                </Link>
            </div>

            {/* ── Content Grid (Partner Uploads or User Saves) ── */}
            <section className="up-saved-section">
                <h2 className="up-section-title">
                    {isPartner ? "Your Published Menu Reels" : "Saved Culinary Collection"}
                </h2>

                {(isPartner ? partnerVideos : savedVideos).length === 0 ? (
                    <div className="up-empty">
                        <Bookmark size={28} color="var(--color-text-muted)" />
                        <h3 className="font-editorial" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                            {isPartner ? "No Reels Published Yet" : "Your Collection is Empty"}
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                            {isPartner ? "Upload your first dish reel to start attracting diners." : "Tap the bookmark icon on any dish reel in the feed to save it here."}
                        </p>
                        <Link to={isPartner ? "/create-food" : "/"} className="btn-editorial btn-editorial--primary" style={{ marginTop: '8px' }}>
                            {isPartner ? "Publish First Reel" : "Browse The Feed"}
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
                                    <Play size={24} fill="white" strokeWidth={0} />
                                </div>
                                <div className="up-grid-meta">
                                    <span className="up-grid-name">{v.name}</span>
                                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontVariantNumeric: 'tabular-nums' }}>
                                        ❤️ {v.likeCount || 0}
                                    </span>
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
                        <button className="up-lightbox-close" onClick={() => setActiveVideo(null)} aria-label="Close modal">
                            <X size={16} />
                        </button>
                        <video src={activeVideo.video} controls autoPlay playsInline className="up-lightbox-video" />
                        <div className="up-lightbox-info">
                            <h3 className="font-editorial" style={{ fontSize: '1.3rem', margin: 0 }}>{activeVideo.name}</h3>
                            {activeVideo.description && (
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                                    {activeVideo.description}
                                </p>
                            )}
                            <div style={{ marginTop: '8px' }}>
                                <button
                                    className="btn-editorial btn-editorial--primary"
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
