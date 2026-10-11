import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../styles/reels.css';
import ReelFeed from '../../components/ReelFeed';
import Skeleton from '../../components/Skeleton';
import Toast from '../../components/Toast';
import { foodApi } from '../../services/api';

const Home = () => {
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const fetchFeed = async () => {
        try {
            const response = await foodApi.getAll();
            setVideos(response.data.foodItems || []);
        } catch (err) {
            console.error("Error fetching reels:", err);
            showToast("Failed to load food reels. Please check your connection.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    async function likeVideo(item) {
        try {
            const response = await foodApi.like(item._id);
            const liked = response.data.like;
            const updatedCount = response.data.likeCount;

            setVideos(prev =>
                prev.map(v =>
                    v._id === item._id
                        ? {
                            ...v,
                            isLiked: liked,
                            likeCount: updatedCount !== undefined ? updatedCount : Math.max(0, (v.likeCount ?? 0) + (liked ? 1 : -1))
                        }
                        : v
                )
            );
        } catch (error) {
            const msg = error.response?.data?.message || "Please sign in to like reels.";
            showToast(msg, "error");
        }
    }

    async function saveVideo(item) {
        try {
            const response = await foodApi.save(item._id);
            const saved = response.data.save;
            const updatedCount = response.data.savesCount;

            setVideos(prev =>
                prev.map(v =>
                    v._id === item._id
                        ? {
                            ...v,
                            isSaved: saved,
                            savesCount: updatedCount !== undefined ? updatedCount : Math.max(0, (v.savesCount ?? 0) + (saved ? 1 : -1))
                        }
                        : v
                )
            );
            showToast(saved ? "Saved to your collection!" : "Removed from saved.", "success");
        } catch (error) {
            const msg = error.response?.data?.message || "Please sign in to save reels.";
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
                emptyMessage="No food reels yet. Check back soon or explore AI Cravings!"
                highlightId={highlightId}
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
