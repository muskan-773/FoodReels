import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, ArrowRight, Check, Play, UtensilsCrossed, Wine } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import VideoCard from '../../components/VideoCard';
import Toast from '../../components/Toast';
import { foodApi } from '../../services/api';
import '../../styles/search.css';

const CUISINE_OPTIONS = ['All', 'Italian', 'Indian', 'Japanese', 'Mexican', 'Bakery & Desserts', 'Healthy & Clean', 'Street Food'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free', 'High-Protein', 'Dessert'];

const CURATED_MOODS = [
    { label: "Slow-Braised Comfort", query: "warm rich slow-simmered comfort dish with melted cheese or rich broth" },
    { label: "Smoky Street Flare", query: "fiery spicy street food with bold spices and charred texture" },
    { label: "Clean & Herbaceous", query: "clean fresh organic vegetable bowl with light herbs and protein" },
    { label: "Decadent Sweet Tooth", query: "warm artisanal chocolate dessert or freshly baked pastry" },
    { label: "Sizzling Claypot & Naan", query: "aromatic Indian curry with freshly baked garlic naan" }
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
                showToast("No exact pairing found. Try broadening your craving description.", "info");
            }
        } catch (err) {
            console.error("AI recommendation error:", err);
            showToast("Failed to generate recommendations. Please try again.", "error");
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
                        <h1 className="search-title">Culinary Discovery</h1>
                        <p className="search-subtitle">
                            Search by flavor profile, dietary lifestyle, or natural cravings. Powered by our Gemini AI Sommelier.
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
                            <Sparkles size={14} />
                            <span>AI Sommelier</span>
                        </button>
                        <button
                            className={`search-tab-btn ${activeTab === 'catalog' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('catalog')}
                            role="tab"
                            aria-selected={activeTab === 'catalog'}
                        >
                            <Compass size={14} />
                            <span>Explore Catalog</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* TAB 1: AI FOOD SOMMELIER */}
            {activeTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="ai-sommelier-card">
                        <div className="ai-card-header">
                            <h2 className="ai-card-title">
                                <span>The Tasting Concierge</span>
                            </h2>
                            <span className="ai-model-tag">Gemini Intelligence</span>
                        </div>

                        <div className="ai-input-wrap">
                            <textarea
                                className="ai-textarea"
                                rows={3}
                                placeholder="Describe your exact mood, texture, or craving (e.g. 'Looking for a warm slow-simmered noodle broth on a cold evening', or 'crispy spicy tacos with melted cheese')..."
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                            />

                            {/* Curated Mood Prompts */}
                            <div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                                    Curated Flavor Profiles
                                </span>
                                <div className="quick-prompts-row">
                                    {CURATED_MOODS.map((m) => (
                                        <button
                                            key={m.label}
                                            type="button"
                                            className="quick-prompt-btn"
                                            onClick={() => {
                                                setAiQuery(m.query);
                                                handleAskAi(m.query);
                                            }}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary Preferences */}
                            <div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                                    Dietary Preferences
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
                                className="btn-editorial btn-editorial--primary"
                                onClick={() => handleAskAi()}
                                disabled={aiLoading || (!aiQuery.trim() && selectedDiets.length === 0)}
                            >
                                <Sparkles size={16} />
                                <span>{aiLoading ? "Curating Pairings…" : "Match My Craving"}</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Recommendation Output */}
                    {aiResults && (
                        <div className="ai-results-section">
                            <div className="ai-summary-banner">
                                <strong style={{ color: 'var(--color-accent-gold)', display: 'block', marginBottom: '2px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Sommelier Tasting Notes
                                </strong>
                                {aiResults.summary}
                            </div>

                            {aiResults.recommendations.length === 0 ? (
                                <EmptyState
                                    icon={<UtensilsCrossed size={22} />}
                                    title="No Exact Pairings Found"
                                    message="Try broadening your craving description or adjusting selected dietary filters."
                                    action={{ label: "Reset Search", onClick: () => { setAiQuery(''); setSelectedDiets([]); } }}
                                />
                            ) : (
                                <div className="ai-cards-grid">
                                    {aiResults.recommendations.map(dish => (
                                        <div key={dish._id} className="ai-dish-card">
                                            <div
                                                className="ai-dish-video-wrap"
                                                onClick={() => navigate(`/?highlight=${dish._id}`)}
                                                title={`Watch ${dish.name} in feed`}
                                            >
                                                <video
                                                    className="ai-dish-video"
                                                    src={dish.video}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                                <div className="ai-dish-match-badge">
                                                    {dish.matchScore || 92}% Match
                                                </div>
                                            </div>

                                            <div className="ai-dish-body">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                    <h3 className="ai-dish-title">{dish.name}</h3>
                                                    {dish.cuisine && (
                                                        <span className="badge-pill badge-pill--gold">{dish.cuisine}</span>
                                                    )}
                                                </div>

                                                <p className="ai-dish-reason">
                                                    {dish.recommendationReason || dish.description}
                                                </p>

                                                {dish.suggestedPairing && (
                                                    <div className="ai-dish-pairing">
                                                        <Wine size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                        Pairing: {dish.suggestedPairing}
                                                    </div>
                                                )}

                                                <button
                                                    className="ai-dish-cta"
                                                    onClick={() => navigate(`/?highlight=${dish._id}`)}
                                                >
                                                    <span>View Reel</span>
                                                    <ArrowRight size={14} />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <SearchBar
                        value={catalogSearch}
                        onChange={setCatalogSearch}
                        placeholder="Search dishes, ingredients, or restaurant kitchens…"
                    />

                    {/* Cuisine Chips */}
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
                            icon={<Compass size={22} />}
                            title={catalogSearch ? `No dishes found for "${catalogSearch}"` : "No food reels in this category"}
                            message={catalogSearch ? "Try checking spelling or exploring all cuisines." : "New kitchen reels are added regularly."}
                            action={catalogSearch || selectedCuisine !== 'All' ? { label: "Reset filters", onClick: () => { setCatalogSearch(''); setSelectedCuisine('All'); } } : null}
                        />
                    ) : (
                        <section className="search-grid" aria-label="Food catalog">
                            {filteredCatalog.map(v => (
                                <VideoCard
                                    key={v._id}
                                    video={v.video}
                                    name={v.name}
                                    cuisine={v.cuisine}
                                    price={v.price}
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
