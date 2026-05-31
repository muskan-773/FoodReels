import React, { useEffect, useState } from 'react';
import '../../styles/reels.css';
import axios from 'axios';
import ReelFeed from '../../components/ReelFeed';
import Skeleton from '../../components/Skeleton';
import Toast from '../../components/Toast';

const api = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true,
});

const Saved = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => setToast({ message, type });

    useEffect(() => {
        api.get("/api/food/save")
            .then(response => {
                const savedFoods = (response.data.savedFoods || []).map((item) => ({
                    _id: item.food._id,
                    video: item.food.video,
                    name: item.food.name,
                    description: item.food.description,
                    likeCount: item.food.likeCount ?? 0,
                    savesCount: item.food.savesCount ?? 0,
                    commentsCount: item.food.commentsCount ?? 0,
                    foodPartner: item.food.foodPartner,
                }));
                setVideos(savedFoods);
            })
            .catch(err => {
                const msg = err.response?.data?.message || "Failed to load saved videos.";
                showToast(msg, "error");
            })
            .finally(() => setLoading(false));
    }, []);

    const removeSaved = async (item) => {
        try {
            await api.post("/api/food/save", { foodId: item._id });
            setVideos(prev => prev.filter(v => v._id !== item._id));
            showToast("Removed from saved.", "success");
        } catch (err) {
            const msg = err.response?.data?.message || "Could not remove saved video.";
            showToast(msg, "error");
        }
    };

    if (loading) return <Skeleton />;

    return (
        <>
            <ReelFeed
                items={videos}
                onSave={removeSaved}
                emptyMessage="Nothing saved yet. Tap the bookmark on any video!"
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

export default Saved;
