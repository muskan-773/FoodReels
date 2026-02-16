import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/reels.css';
import ReelFeed from '../../components/ReelFeed';

// Create axios instance
const api = axios.create({
    baseURL: "http://localhost:3001"
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const Home = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        api.get("/api/food")
            .then(response => {
                console.log(response.data);
                setVideos(response.data.foodItems);
            })
            .catch(err => {
                console.log("Error fetching videos:", err);
            });
    }, []);

    async function likeVideo(item) {
        try {
            const response = await api.post("/api/food/like", {
                foodId: item._id
            });

            if (response.data.like) {
                setVideos(prev =>
                    prev.map(v =>
                        v._id === item._id
                            ? { ...v, likeCount: v.likeCount + 1 }
                            : v
                    )
                );
            } else {
                setVideos(prev =>
                    prev.map(v =>
                        v._id === item._id
                            ? { ...v, likeCount: v.likeCount - 1 }
                            : v
                    )
                );
            }

        } catch (error) {
            console.log("Like error:", error.response?.data || error.message);
        }
    }

    async function saveVideo(item) {
        try {
            const response = await api.post("/api/food/save", {
                foodId: item._id
            });

            if (response.data.save) {
                setVideos(prev =>
                    prev.map(v =>
                        v._id === item._id
                            ? { ...v, savesCount: v.savesCount + 1 }
                            : v
                    )
                );
            } else {
                setVideos(prev =>
                    prev.map(v =>
                        v._id === item._id
                            ? { ...v, savesCount: v.savesCount - 1 }
                            : v
                    )
                );
            }

        } catch (error) {
            console.log("Save error:", error.response?.data || error.message);
        }
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage="No videos available."
        />
    );
};

export default Home;
