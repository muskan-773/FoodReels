import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/reels.css';
import ReelFeed from '../../components/ReelFeed';
import Skeleton from '../../components/Skeleton';
import Toast from '../../components/Toast';

const api = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true,
});

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        api.get("/api/food")
            .then(response => {
                setVideos(response.data.foodItems || []);
            })
            .catch(err => {
                console.error("Error fetching videos:", err);
                showToast("Failed to load videos. Please try again.", "error");
            })
            .finally(() => setLoading(false));
    }, []);

    async function likeVideo(item) {
        try {
            const response = await api.post("/api/food/like", { foodId: item._id });
            const liked = response.data.like;
            setVideos(prev =>
                prev.map(v =>
                    v._id === item._id
                        ? { ...v, likeCount: Math.max(0, (v.likeCount ?? 0) + (liked ? 1 : -1)) }
                        : v
                )
            );
        } catch (error) {
            const msg = error.response?.data?.message || "Please log in to like videos.";
            showToast(msg, "error");
        }
    }

    async function saveVideo(item) {
        try {
            const response = await api.post("/api/food/save", { foodId: item._id });
            const saved = response.data.save;
            setVideos(prev =>
                prev.map(v =>
                    v._id === item._id
                        ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 0) + (saved ? 1 : -1)) }
                        : v
                )
            );
            showToast(saved ? "Saved!" : "Removed from saved.", "success");
        } catch (error) {
            const msg = error.response?.data?.message || "Please log in to save videos.";
            showToast(msg, "error");
        }
    }

    if (loading) return <Skeleton />;

    return (
        <>
            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={saveVideo}
                emptyMessage="No videos yet. Check back soon!"
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default Home;
