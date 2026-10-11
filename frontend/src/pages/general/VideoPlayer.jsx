import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../styles/video-player.css';
import Toast from '../../components/Toast';
import ShareSheet from '../../components/ShareSheet';
import { foodApi } from '../../services/api';
import {
    ArrowLeft,
    Heart,
    Bookmark,
    Share2,
    Store,
    Sparkles,
    ChevronRight,
    UtensilsCrossed
} from 'lucide-react';

const VideoPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const showToast = (message, type = 'info') => setToast({ message, type });

    useEffect(() => {
        foodApi.getById(id)
            .then(res => {
                const item = res.data.food;
                setFood(item);
                setLiked(Boolean(item.isLiked));
                setSaved(Boolean(item.isSaved));
            })
            .catch(err => setError(err.response?.data?.message || "Reel not found."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async () => {
        try {
            const res = await foodApi.like(id);
            const isLiked = res.data.like;
            setLiked(isLiked);
            setFood(prev => ({
                ...prev,
                likeCount: Math.max(0, (prev.likeCount ?? 0) + (isLiked ? 1 : -1))
            }));
        } catch (err) {
            showToast(err.response?.data?.message || "Please sign in to like dishes.", "error");
        }
    };

    const handleSave = async () => {
        try {
            const res = await foodApi.save(id);
            const isSaved = res.data.save;
            setSaved(isSaved);
            setFood(prev => ({
                ...prev,
                savesCount: Math.max(0, (prev.savesCount ?? 0) + (isSaved ? 1 : -1))
            }));
            showToast(isSaved ? "Saved to your culinary collection!" : "Removed from collection.", "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Please sign in to save dishes.", "error");
        }
    };

    if (loading) {
        return (
            <div className="vp-page">
                <div className="vp-loading">
                    <div className="pp-spinner" />
                    <p>Pouring reel into view…</p>
                </div>
            </div>
        );
    }

    if (error || !food) {
        return (
            <div className="vp-page">
                <div className="vp-error">
                    <p>{error || "Culinary reel not found."}</p>
                    <button onClick={() => navigate(-1)} className="vp-back-btn">
                        <ArrowLeft size={16} /> Return to Discoveries
                    </button>
                </div>
            </div>
        );
    }

    const partnerId = typeof food.foodPartner === 'object' ? food.foodPartner?._id : food.foodPartner;
    const partnerName = typeof food.foodPartner === 'object' ? food.foodPartner?.name : 'Partner Kitchen';

    return (
        <div className="vp-page">
            <button className="vp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                <ArrowLeft size={16} />
                <span>Back to feed</span>
            </button>

            <div className="vp-layout">
                {/* ── Left: Video Reel ── */}
                <div className="vp-video-wrap">
                    <video
                        ref={videoRef}
                        className="vp-video"
                        src={food.video}
                        controls
                        playsInline
                        autoPlay
                        loop
                    />
                </div>

                {/* ── Right: Dish Editorial Info ── */}
                <aside className="vp-info">
                    <div className="vp-badge-row">
                        {food.cuisine && (
                            <span className="vp-cuisine-badge">
                                <UtensilsCrossed size={12} />
                                {food.cuisine}
                            </span>
                        )}
                        {food.price != null && Number(food.price) > 0 && (
                            <span className="vp-price-badge">
                                ${Number(food.price).toFixed(2)}
                            </span>
                        )}
                    </div>

                    <h1 className="vp-title">{food.name}</h1>

                    {food.dietaryTags && food.dietaryTags.length > 0 && (
                        <div className="vp-tag-list">
                            {food.dietaryTags.map(tag => (
                                <span key={tag} className="vp-tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {food.description && (
                        <div className="vp-description-block">
                            <div className="vp-description-label">Chef's Tasting Notes</div>
                            <p className="vp-description">{food.description}</p>
                        </div>
                    )}

                    {/* ── Interactive Actions ── */}
                    <div className="vp-actions">
                        <button
                            className={`vp-action-btn ${liked ? 'vp-action-btn--liked' : ''}`}
                            onClick={handleLike}
                            aria-label={liked ? "Unlike dish" : "Like dish"}
                        >
                            <Heart
                                size={18}
                                fill={liked ? "currentColor" : "none"}
                                color={liked ? "var(--color-primary)" : "currentColor"}
                            />
                            <span>{food.likeCount ?? 0}</span>
                        </button>

                        <button
                            className={`vp-action-btn ${saved ? 'vp-action-btn--saved' : ''}`}
                            onClick={handleSave}
                            aria-label={saved ? "Unsave dish" : "Save dish"}
                        >
                            <Bookmark
                                size={18}
                                fill={saved ? "currentColor" : "none"}
                                color={saved ? "var(--color-accent-gold)" : "currentColor"}
                            />
                            <span>{food.savesCount ?? 0}</span>
                        </button>

                        <button
                            className="vp-action-btn"
                            onClick={() => setShareOpen(true)}
                            aria-label="Share dish reel"
                        >
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                    </div>

                    {/* ── Partner Kitchen Card ── */}
                    {partnerId && (
                        <Link to={`/food-partner/${partnerId}`} className="vp-partner-card">
                            <div className="vp-partner-left">
                                <div className="vp-partner-icon">
                                    <Store size={20} />
                                </div>
                                <div>
                                    <h4 className="vp-partner-title">{partnerName}</h4>
                                    <p className="vp-partner-sub">Explore full menu & kitchen profile</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="vp-partner-arrow" />
                        </Link>
                    )}
                </aside>
            </div>

            {/* ── Share Modal ── */}
            <ShareSheet
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                reel={food}
            />

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
};

export default VideoPlayer;
