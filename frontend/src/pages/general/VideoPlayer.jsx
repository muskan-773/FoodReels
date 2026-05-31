import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/video-player.css';
import Toast from '../../components/Toast';

const api = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true,
});

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

    const showToast = (message, type = 'info') => setToast({ message, type });

    useEffect(() => {
        api.get(`/api/food/${id}`)
            .then(res => setFood(res.data.food))
            .catch(err => setError(err.response?.data?.message || "Video not found."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async () => {
        try {
            const res = await api.post('/api/food/like', { foodId: id });
            const isLiked = res.data.like;
            setLiked(isLiked);
            setFood(prev => ({
                ...prev,
                likeCount: Math.max(0, (prev.likeCount ?? 0) + (isLiked ? 1 : -1))
            }));
        } catch (err) {
            showToast(err.response?.data?.message || "Please log in to like.", "error");
        }
    };

    const handleSave = async () => {
        try {
            const res = await api.post('/api/food/save', { foodId: id });
            const isSaved = res.data.save;
            setSaved(isSaved);
            setFood(prev => ({
                ...prev,
                savesCount: Math.max(0, (prev.savesCount ?? 0) + (isSaved ? 1 : -1))
            }));
            showToast(isSaved ? "Saved!" : "Removed from saved.", "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Please log in to save.", "error");
        }
    };

    if (loading) {
        return (
            <div className="vp-page">
                <div className="vp-loading" aria-busy="true">Loading…</div>
            </div>
        );
    }

    if (error || !food) {
        return (
            <div className="vp-page">
                <div className="vp-error">
                    <p>{error || "Video not found."}</p>
                    <button onClick={() => navigate(-1)} className="vp-back-btn">← Go back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="vp-page">
            <button className="vp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                ← Back
            </button>

            <div className="vp-layout">
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

                <aside className="vp-info">
                    <h1 className="vp-title">{food.name}</h1>

                    {food.description && (
                        <p className="vp-description">{food.description}</p>
                    )}

                    <div className="vp-actions">
                        <button
                            className={`vp-action-btn ${liked ? 'vp-action-btn--active' : ''}`}
                            onClick={handleLike}
                            aria-label={liked ? "Unlike" : "Like"}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                            <span>{food.likeCount ?? 0}</span>
                        </button>

                        <button
                            className={`vp-action-btn ${saved ? 'vp-action-btn--active' : ''}`}
                            onClick={handleSave}
                            aria-label={saved ? "Unsave" : "Save"}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                            </svg>
                            <span>{food.savesCount ?? 0}</span>
                        </button>
                    </div>

                    {food.foodPartner && (
                        <Link
                            to={`/food-partner/${typeof food.foodPartner === 'object' ? food.foodPartner._id : food.foodPartner}`}
                            className="vp-partner-link"
                        >
                            🍴 {typeof food.foodPartner === 'object' ? food.foodPartner.name : 'Visit store'} →
                        </Link>
                    )}
                </aside>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
};

export default VideoPlayer;
