import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import VideoCard from '../../components/VideoCard';
import Toast from '../../components/Toast';
import { foodApi } from '../../services/api';
import '../../styles/search.css';

const CUISINE_OPTIONS = ['All', 'Italian', 'Indian', 'Japanese', 'Mexican', 'Bakery & Desserts', 'Healthy & Clean'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free', 'High-Protein', 'Dessert'];

const QUICK_PROMPTS = [
    { label: "🌶️ Spicy Street Food", query: "spicy sizzling street food with bold spices" },
    { label: "🧀 Cheesy Comfort Food", query: "rich molten melted cheese pasta or pizza" },
    { label: "🍜 Hot Steaming Soup", query: "warm soothing noodle ramen broth on a cold evening" },
    { label: "🥗 Healthy High-Protein", query: "clean fresh organic salad bowl with protein" },
    { label: "🍰 Decadent Dessert", query: "warm rich chocolate dessert or freshly baked sweet" }
];

const Search = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'catalog'
    const [allVideos, setAllVideos] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    // AI Sommelier State
    const [aiQuery, setAiQuery] = useState('');
    const [selectedDiets, setSelectedDiets] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResults, setAiResults] = useState(null);

    // Catalog Search State
    const [catalogSearch, setCatalogSearch] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => setToast({ message, type });

    // Fetch initial catalog
    useEffect(() => {
        foodApi.getAll()
            .then(res => setAllVideos(res.data.foodItems || []))
            .catch(err => console.error("Error loading catalog:", err))
            .finally(() => setLoadingCatalog(false));
    }, []);

    // Toggle dietary tag
    const toggleDietaryTag = (diet) => {
        setSelectedDiets(prev =>
            prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
        );
    };

    // Trigger AI Recommendations
    const handleAskAi = async (customQuery = null) => {
        const queryToUse = customQuery !== null ? customQuery : aiQuery;
        setAiLoading(true);

        try {
            const res = await foodApi.getRecommendations({
                query: queryToUse.trim(),
                dietaryPreferences: selectedDiets,
            });

            setAiResults(res.data);
            if (!res.data.recommendations || res.data.recommendations.length === 0) {
                showToast("No exact matches found. Try broadening your craving description.", "info");
            }
        } catch (err) {
            console.error("AI recommendation error:", err);
            showToast("Failed to generate AI recommendations. Please try again.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    // Filtered Catalog
    const filteredCatalog = useMemo(() => {
        let items = allVideos;

        if (selectedCuisine !== 'All') {
            items = items.filter(v =>
                (v.cuisine || '').toLowerCase().includes(selectedCuisine.toLowerCase())
            );
        }

        const q = catalogSearch.trim().toLowerCase();
        if (q) {
            items = items.filter(v =>
                v.name?.toLowerCase().includes(q) ||
                v.description?.toLowerCase().includes(q) ||
                v.cuisine?.toLowerCase().includes(q) ||
                (v.dietaryTags || []).some(t => t.toLowerCase().includes(q)) ||
                (typeof v.foodPartner === 'object' && v.foodPartner?.name?.toLowerCase().includes(q))
            );
        }

        return items;
    }, [allVideos, selectedCuisine, catalogSearch]);

    return (
        <div className="search-page">
            <header className="search-header">
                <div className="search-title-row">
                    <div>
                        <h1 className="search-title">Discover Food</h1>
                        <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                            Find your next meal with AI culinary intelligence or browse the catalog.
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="search-tabs" role="tablist">
                        <button
                            className={`search-tab-btn ${activeTab === 'ai' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                            role="tab"
                            aria-selected={activeTab === 'ai'}
                        >
                            <span>✨ AI Sommelier</span>
                        </button>
                        <button
                            className={`search-tab-btn ${activeTab === 'catalog' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('catalog')}
                            role="tab"
                            aria-selected={activeTab === 'catalog'}
                        >
                            <span>🔍 Browse All</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* TAB 1: AI FOOD SOMMELIER */}
            {activeTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div className="ai-sommelier-card">
                        <div className="ai-card-header">
                            <h2 className="ai-card-title">
                                <span>✨</span> What are you craving today?
                            </h2>
                            <span className="ai-model-tag">Gemini Powered</span>
                        </div>

                        <div className="ai-input-wrap">
                            <textarea
                                className="ai-textarea"
                                rows={3}
                                placeholder="Describe what you want to eat in plain words (e.g., 'Something spicy and crispy for dinner', 'Comforting Italian pasta with creamy sauce', 'Light high-protein salad')..."
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                            />

                            {/* Quick craving presets */}
                            <div className="quick-prompts-row">
                                {QUICK_PROMPTS.map((p) => (
                                    <button
                                        key={p.label}
                                        type="button"
                                        className="quick-prompt-btn"
                                        onClick={() => {
                                            setAiQuery(p.query);
                                            handleAskAi(p.query);
                                        }}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            {/* Dietary preferences pills */}
                            <div style={{ marginTop: '4px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                                    Dietary Preferences (Optional):
                                </span>
                                <div className="dietary-tags-row">
                                    {DIETARY_OPTIONS.map(diet => (
                                        <button
                                            key={diet}
                                            type="button"
                                            className={`diet-tag-btn ${selectedDiets.includes(diet) ? 'is-selected' : ''}`}
                                            onClick={() => toggleDietaryTag(diet)}
                                        >
                                            {selectedDiets.includes(diet) ? `✓ ${diet}` : `+ ${diet}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="ai-action-row">
                            <button
                                className="ai-submit-btn"
                                onClick={() => handleAskAi()}
                                disabled={aiLoading || (!aiQuery.trim() && selectedDiets.length === 0)}
                            >
                                {aiLoading ? (
                                    <>
                                        <span style={{ display: 'inline-block', animation: 'search-shimmer 1s infinite' }}>⏳</span>
                                        Matching Cravings…
                                    </>
                                ) : (
                                    <>✨ Find Matching Reels</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* AI Recommendations Output */}
                    {aiResults && (
                        <div className="ai-results-section">
                            <div className="ai-summary-banner">
                                <strong>💡 AI Sommelier:</strong> {aiResults.summary}
                            </div>

                            {aiResults.recommendations.length === 0 ? (
                                <EmptyState
                                    icon="🍽️"
                                    title="No matching dishes found"
                                    message="Try adjusting your craving description or removing dietary filters."
                                    action={{ label: "Reset Cravings", onClick: () => { setAiQuery(''); setSelectedDiets([]); } }}
                                />
                            ) : (
                                <div className="ai-cards-grid">
                                    {aiResults.recommendations.map(dish => (
                                        <div key={dish._id} className="ai-dish-card">
                                            <div
                                                className="ai-dish-video-wrap"
                                                onClick={() => navigate(`/?highlight=${dish._id}`)}
                                            >
                                                <video
                                                    className="ai-dish-video"
                                                    src={dish.video}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                                <div className="ai-dish-match-badge">
                                                    ★ {dish.matchScore || 90}% Match
                                                </div>
                                            </div>

                                            <div className="ai-dish-body">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <h3 className="ai-dish-title">{dish.name}</h3>
                                                    {dish.cuisine && (
                                                        <span className="badge-tag tag-cuisine">{dish.cuisine}</span>
                                                    )}
                                                </div>

                                                <p className="ai-dish-reason">
                                                    ✨ <em>{dish.recommendationReason || dish.description}</em>
                                                </p>

                                                {dish.suggestedPairing && (
                                                    <div className="ai-dish-pairing">
                                                        🍷 Pairing: {dish.suggestedPairing}
                                                    </div>
                                                )}

                                                <button
                                                    className="ai-dish-cta"
                                                    onClick={() => navigate(`/?highlight=${dish._id}`)}
                                                >
                                                    ▶ Watch Reel →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: EXPLORE CATALOG */}
            {activeTab === 'catalog' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <SearchBar
                        value={catalogSearch}
                        onChange={setCatalogSearch}
                        placeholder="Search by dish, ingredient, or restaurant…"
                    />

                    {/* Cuisine Filter Pills */}
                    <div className="cuisine-chips-row" role="radiogroup" aria-label="Cuisine filter">
                        {CUISINE_OPTIONS.map(c => (
                            <button
                                key={c}
                                className={`cuisine-chip ${selectedCuisine === c ? 'is-active' : ''}`}
                                onClick={() => setSelectedCuisine(c)}
                                role="radio"
                                aria-checked={selectedCuisine === c}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {loadingCatalog ? (
                        <div className="search-grid" aria-busy="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="search-skeleton-card" />
                            ))}
                        </div>
                    ) : filteredCatalog.length === 0 ? (
                        <EmptyState
                            icon="🔍"
                            title={catalogSearch ? `No results for "${catalogSearch}"` : "No food reels found"}
                            message={catalogSearch ? "Try checking spelling or choosing a different cuisine." : "No dishes found in this category."}
                            action={catalogSearch || selectedCuisine !== 'All' ? { label: "Reset filters", onClick: () => { setCatalogSearch(''); setSelectedCuisine('All'); } } : null}
                        />
                    ) : (
                        <section className="search-grid" aria-label="Food catalog">
                            {filteredCatalog.map(v => (
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
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Search;
