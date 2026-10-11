import React, { useEffect, useState } from 'react';
import '../../styles/reels.css';
import ReelFeed from '../../components/ReelFeed';
import Skeleton from '../../components/Skeleton';
import Toast from '../../components/Toast';
import { foodApi } from '../../services/api';

const Saved = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => setToast({ message, type });

    useEffect(() => {
        foodApi.getSaved()
            .then(response => {
                const rawItems = response.data.savedFoods || [];
                // Filter out any entries where the referenced food was deleted
                const cleanFoods = rawItems
                    .filter(item => item && (item.video || item.name))
                    .map(item => ({
                        _id: item._id,
                        video: item.video,
                        name: item.name,
                        description: item.description,
                        cuisine: item.cuisine || 'General',
                        dietaryTags: item.dietaryTags || [],
                        likeCount: item.likeCount ?? 0,
                        savesCount: item.savesCount ?? 0,
                        commentsCount: item.commentsCount ?? 0,
                        foodPartner: item.foodPartner,
                        isSaved: true
                    }));
                setVideos(cleanFoods);
            })
            .catch(err => {
                const msg = err.response?.data?.message || "Please log in to view your saved reels.";
                showToast(msg, "error");
            })
            .finally(() => setLoading(false));
    }, []);

    const removeSaved = async (item) => {
        try {
            await foodApi.save(item._id);
            setVideos(prev => prev.filter(v => v._id !== item._id));
            showToast("Removed from saved reels.", "success");
        } catch (err) {
            const msg = err.response?.data?.message || "Could not remove saved reel.";
            showToast(msg, "error");
        }
    };

    if (loading) return <Skeleton />;

    return (
        <>
            <ReelFeed
                items={videos}
                onSave={removeSaved}
                emptyMessage="No saved reels yet. Tap the bookmark icon on any delicious reel to save it!"
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
