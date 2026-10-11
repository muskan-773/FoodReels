import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { partnerApi } from '../../services/api';
import '../../styles/partner-profile.css';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Heart,
    Bookmark,
    Play,
    Store,
    Film,
    X,
    UtensilsCrossed
} from 'lucide-react';
import EmptyState from '../../components/EmptyState';

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('');
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
        partnerApi.getById(id)
            .then(res => {
                setProfile(res.data.foodPartner);
                setVideos(res.data.foodPartner?.foodItems || []);
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to load restaurant profile.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="pp-loading">
                <div className="pp-spinner" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="pp-page">
                <div className="pp-error">
                    <p>{error || 'Partner kitchen profile not found.'}</p>
                    <button onClick={() => navigate(-1)}>Return to Discoveries</button>
                </div>
            </div>
        );
    }

    const totalLikes = videos.reduce((s, v) => s + (v.likeCount ?? 0), 0);
    const totalSaves = videos.reduce((s, v) => s + (v.savesCount ?? 0), 0);
    const initials = getInitials(profile.name);

    return (
        <div className="pp-page">
            {/* ── Back Navigation ── */}
            <button className="pp-back" onClick={() => navigate(-1)} aria-label="Go back">
                <ArrowLeft size={16} />
                <span>Back to feed</span>
            </button>

            {/* ── Editorial Restaurant Header ── */}
            <div className="pp-hero">
                <div className="pp-hero-badge">
                    <Store size={12} />
                    <span>Verified Culinary Partner</span>
                </div>

                <div className="pp-hero-main">
                    <div className="pp-avatar" aria-label={profile.name}>
                        {initials || <UtensilsCrossed size={32} />}
                    </div>

                    <div className="pp-hero-text">
                        <h1 className="pp-name">{profile.name}</h1>
                        <p className="pp-contact">Curated by {profile.contactName || 'Head Chef'}</p>
                    </div>
                </div>
            </div>

            {/* ── Restaurant Contact & Location ── */}
            <div className="pp-info-bar">
                {profile.address && (
                    <div className="pp-info-item">
                        <MapPin size={16} />
                        <span>{profile.address}</span>
                    </div>
                )}
                {profile.phone && (
                    <div className="pp-info-item">
                        <Phone size={16} />
                        <a href={`tel:${profile.phone}`} className="pp-info-link">
                            {profile.phone}
                        </a>
                    </div>
                )}
                {profile.email && (
                    <div className="pp-info-item">
                        <Mail size={16} />
                        <a href={`mailto:${profile.email}`} className="pp-info-link">
                            {profile.email}
                        </a>
                    </div>
                )}
            </div>

            {/* ── Key Metrics ── */}
            <div className="pp-stats">
                <div className="pp-stat-card">
                    <span className="pp-stat-value">{videos.length}</span>
                    <span className="pp-stat-label">Signature Reels</span>
                </div>
                <div className="pp-stat-card">
                    <span className="pp-stat-value">{totalLikes}</span>
                    <span className="pp-stat-label">Total Appreciations</span>
                </div>
                <div className="pp-stat-card">
                    <span className="pp-stat-value">{totalSaves}</span>
                    <span className="pp-stat-label">Saved to Collections</span>
                </div>
            </div>

            {/* ── Video Gallery ── */}
            <section className="pp-grid-section">
                <div className="pp-section-header">
                    <h2 className="pp-grid-title">Culinary Reels</h2>
                    <span className="pp-grid-count">{videos.length} dishes published</span>
                </div>

                {videos.length === 0 ? (
                    <EmptyState
                        icon={<Film size={28} />}
                        title="No reels published yet"
                        message="This kitchen has not uploaded video reels to their menu gallery yet."
                    />
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
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="pp-grid-video"
                                />
                                <div className="pp-grid-overlay">
                                    <div className="pp-play-badge">
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                    <div className="pp-grid-info">
                                        <div className="pp-grid-name">{v.name}</div>
                                        <div className="pp-grid-metrics">
                                            <span className="pp-grid-metric">
                                                <Heart size={12} fill="var(--color-primary)" color="var(--color-primary)" />
                                                {v.likeCount ?? 0}
                                            </span>
                                            <span className="pp-grid-metric">
                                                <Bookmark size={12} fill="var(--color-accent-gold)" color="var(--color-accent-gold)" />
                                                {v.savesCount ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Video Lightbox Modal ── */}
            {activeVideo && (
                <div
                    className="pp-lightbox"
                    onClick={() => setActiveVideo(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={activeVideo.name}
                >
                    <div className="pp-lightbox-inner" onClick={e => e.stopPropagation()}>
                        <button
                            className="pp-lightbox-close"
                            onClick={() => setActiveVideo(null)}
                            aria-label="Close reel modal"
                        >
                            <X size={18} />
                        </button>
                        <video
                            src={activeVideo.video}
                            controls
                            autoPlay
                            playsInline
                            className="pp-lightbox-video"
                        />
                        <div className="pp-lightbox-content">
                            <h3 className="pp-lightbox-title">{activeVideo.name}</h3>
                            {activeVideo.description && (
                                <p className="pp-lightbox-desc">{activeVideo.description}</p>
                            )}
                            <div className="pp-lightbox-stats">
                                <span className="pp-grid-metric">
                                    <Heart size={14} fill="var(--color-primary)" color="var(--color-primary)" />
                                    {activeVideo.likeCount ?? 0} foodies loved this
                                </span>
                                <span className="pp-grid-metric">
                                    <Bookmark size={14} fill="var(--color-accent-gold)" color="var(--color-accent-gold)" />
                                    {activeVideo.savesCount ?? 0} saved
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerProfile;
