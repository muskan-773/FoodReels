import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import VideoCard from '../../components/VideoCard';
import '../../styles/search.css';

const api = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true,
});

const Search = () => {
    const [query, setQuery] = useState('');
    const [allVideos, setAllVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/api/food")
            .then(res => setAllVideos(res.data.foodItems || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allVideos;
        return allVideos.filter(v =>
            v.name?.toLowerCase().includes(q) ||
            v.description?.toLowerCase().includes(q) ||
            (typeof v.foodPartner === 'object' && v.foodPartner?.name?.toLowerCase().includes(q))
        );
    }, [query, allVideos]);

    return (
        <div className="search-page">
            <header className="search-header">
                <h1 className="search-title">Discover Food</h1>
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Search by name, description, or restaurant…"
                />
            </header>

            {loading ? (
                <div className="search-loading" aria-busy="true">
                    <div className="search-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="search-skeleton-card" aria-hidden="true" />
                        ))}
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title={query ? `No results for "${query}"` : "No videos yet"}
                    message={query ? "Try a different search term." : "Check back soon for new food reels!"}
                    action={query ? { label: "Clear search", onClick: () => setQuery('') } : null}
                />
            ) : (
                <section className="search-grid" aria-label="Search results">
                    {filtered.map(v => (
                        <VideoCard
                            key={v._id}
                            video={v.video}
                            name={v.name}
                            likeCount={v.likeCount ?? 0}
                            savesCount={v.savesCount ?? 0}
                            onClick={() => navigate(`/?highlight=${v._id}`)}
                        />
                    ))}
                </section>
            )}
        </div>
    );
};

export default Search;
