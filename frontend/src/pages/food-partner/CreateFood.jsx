import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../../styles/create-food.css';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../../components/Toast';
import { foodApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Sparkles,
    UploadCloud,
    Film,
    Check,
    Plus,
    Trash2,
    RefreshCw,
    ChefHat,
    DollarSign,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

const CUISINES = [
    'Italian',
    'Indian',
    'Japanese',
    'Mexican',
    'Asian & Wok',
    'American Bistro',
    'Bakery & Pastry',
    'Plant-Based & Clean',
    'Artisanal Street Food',
    'Mediterranean'
];

const DIETARY_TAG_OPTIONS = [
    'Vegetarian',
    'Vegan',
    'Spicy',
    'Gluten-Free',
    'High-Protein',
    'Dessert',
    'Cheesy',
    'Organic'
];

const CreateFood = () => {
    const { isPartner, login, user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cuisine, setCuisine] = useState('Italian');
    const [selectedTags, setSelectedTags] = useState([]);
    const [price, setPrice] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [videoURL, setVideoURL] = useState('');
    const [fileError, setFileError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [partnerSwitching, setPartnerSwitching] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const showToast = (message, type = 'info') => setToast({ message, type });

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // 1-Click login as demo chef if currently not logged in as a partner
    const handleQuickPartnerLogin = async () => {
        setPartnerSwitching(true);
        try {
            const res = await authApi.loginPartner({
                email: 'marco@bellanapoli.com',
                password: 'password123'
            });
            login(res.data.token, res.data.foodPartner, 'foodPartner');
            showToast("Switched to Verified Partner Account (Bella Napoli Pizzeria)!", "success");
        } catch (err) {
            showToast("Failed to auto-sign in demo partner. Please use the Partner Login page.", "error");
        } finally {
            setPartnerSwitching(false);
        }
    };

    // ── AI description generator ──────────────────────────────
    const generateDescription = async () => {
        if (!name.trim()) {
            showToast("Enter a dish title first so the culinary AI knows what to craft.", "error");
            return;
        }
        setAiLoading(true);
        try {
            const response = await foodApi.generateDescription(name.trim(), cuisine);
            setDescription(response.data.description);
            showToast("Editorial tasting notes crafted with Gemini AI.", "success");
        } catch (err) {
            const msg = err.response?.data?.message || "AI generation failed. Please compose manually.";
            showToast(msg, "error");
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        if (!videoFile) { setVideoURL(''); return; }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) { setVideoFile(null); setFileError(''); return; }
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid MP4, WebM, or MOV video.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDragOver = (e) => e.preventDefault();
    const openFileDialog = () => fileInputRef.current?.click();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !videoFile) return;

        if (!isPartner) {
            showToast("You must be logged in as a Restaurant Partner to upload reels.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('cuisine', cuisine);
            formData.append('dietaryTags', JSON.stringify(selectedTags));
            formData.append('price', price || 0);
            formData.append('video', videoFile);

            await foodApi.create(formData);

            showToast("Culinary reel published successfully to FoodReels!", "success");
            setTimeout(() => navigate("/"), 1200);
        } catch (err) {
            console.error("Upload error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to publish reel. Please verify your upload.";
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile || submitting, [name, videoFile, submitting]);

    return (
        <div className="create-food-page">
            <div className="create-food-card">
                <header className="create-food-header">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        <ChefHat size={16} /> Partner Kitchen Studio
                    </div>
                    <h1 className="create-food-title">Publish a Culinary Reel</h1>
                    <p className="create-food-subtitle">Upload high-resolution video footage of your dish. Showcase the artistry, texture, and aroma to food lovers across the city.</p>
                </header>

                {/* ── Partner Authentication Notice ── */}
                {!isPartner && (
                    <div style={{
                        background: 'rgba(223, 158, 56, 0.1)',
                        border: '1px solid rgba(223, 158, 56, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-gold)', fontSize: '0.88rem', fontWeight: 600 }}>
                            <AlertCircle size={18} />
                            <span>Restaurant Partner Account Required</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                            You are currently viewing as a guest or foodie member. Video reel uploading requires signing in to a restaurant partner account.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <button
                                type="button"
                                onClick={handleQuickPartnerLogin}
                                disabled={partnerSwitching}
                                style={{
                                    background: 'var(--color-accent-gold)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '7px 14px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Sparkles size={13} />
                                {partnerSwitching ? "Switching…" : "1-Click Switch: Marco Rossi Demo Kitchen"}
                            </button>
                            <Link
                                to="/food-partner/login"
                                style={{
                                    color: '#fff',
                                    padding: '7px 14px',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Partner Login <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                )}

                <form className="create-food-form" onSubmit={onSubmit}>
                    {/* Video Upload Field */}
                    <div className="field-group">
                        <label htmlFor="foodVideo">Dish Video Reel <span style={{ color: 'var(--color-primary)' }}>*</span></label>
                        <input
                            id="foodVideo"
                            ref={fileInputRef}
                            className="file-input-hidden"
                            type="file"
                            accept="video/*"
                            onChange={onFileChange}
                        />

                        <div
                            className="file-dropzone"
                            role="button"
                            tabIndex={0}
                            onClick={openFileDialog}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileDialog(); } }}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            aria-label="Upload reel video file"
                        >
                            <div className="file-dropzone-inner">
                                <div className="file-dropzone-icon">
                                    <UploadCloud size={38} strokeWidth={1.5} />
                                </div>
                                <div className="file-dropzone-text">
                                    <strong>Click to select video</strong> or drag and drop reel
                                </div>
                                <div className="file-hint">MP4, WebM, or MOV • Vertical 9:16 or 4:5 recommended • Up to 100MB</div>
                            </div>
                        </div>

                        {fileError && <p className="error-text" role="alert">{fileError}</p>}

                        {videoFile && (
                            <div className="file-chip" aria-live="polite">
                                <Film size={16} color="var(--color-primary)" />
                                <span className="file-chip-name">{videoFile.name}</span>
                                <span className="file-chip-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <button type="button" className="btn-ghost" onClick={openFileDialog} style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                                        Change
                                    </button>
                                    <button type="button" className="btn-ghost danger" onClick={() => { setVideoFile(null); setFileError(''); }} style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {videoURL && (
                        <div className="video-preview">
                            <video className="video-preview-el" src={videoURL} controls playsInline preload="metadata" />
                        </div>
                    )}

                    {/* Dish Name */}
                    <div className="field-group">
                        <label htmlFor="foodName">Dish Title <span style={{ color: 'var(--color-primary)' }}>*</span></label>
                        <input
                            id="foodName"
                            type="text"
                            placeholder="e.g., Artisanal Truffle & Chanterelle Tagliolini"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                        />
                    </div>

                    {/* Cuisine & Price Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div className="field-group">
                            <label htmlFor="foodCuisine">Cuisine Heritage</label>
                            <select
                                id="foodCuisine"
                                value={cuisine}
                                onChange={(e) => setCuisine(e.target.value)}
                            >
                                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="field-group">
                            <label htmlFor="foodPrice">Menu Price ($ USD)</label>
                            <input
                                id="foodPrice"
                                type="number"
                                placeholder="e.g., 24.50"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min={0}
                                step={0.5}
                            />
                        </div>
                    </div>

                    {/* Dietary Tags */}
                    <div className="field-group">
                        <label>Dietary & Flavor Attributes</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                            {DIETARY_TAG_OPTIONS.map(tag => {
                                const active = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '6px 13px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            borderRadius: 'var(--radius-full)',
                                            border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            background: active ? 'rgba(226, 80, 55, 0.16)' : 'var(--color-surface-elevated)',
                                            color: active ? '#fff' : 'var(--color-text-secondary)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all var(--transition-fast)'
                                        }}
                                    >
                                        {active ? <Check size={12} color="var(--color-primary)" /> : <Plus size={12} />}
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description with AI Assistant */}
                    <div className="field-group">
                        <div className="desc-label-row">
                            <label htmlFor="foodDesc">Tasting Notes & Story</label>
                            <button
                                type="button"
                                className="btn-ai-generate"
                                onClick={generateDescription}
                                disabled={aiLoading || !name.trim()}
                                aria-label="Craft editorial tasting notes with Gemini AI"
                            >
                                {aiLoading ? (
                                    <>
                                        <RefreshCw size={13} className="spin" />
                                        Crafting…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={13} />
                                        Craft with Gemini AI
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            id="foodDesc"
                            rows={3}
                            placeholder="Describe texture, flavor highlights, sourcing, and preparation notes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                        />
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <button
                            className="btn-primary"
                            type="submit"
                            disabled={isDisabled}
                            style={{ width: '100%', padding: '14px', fontSize: '0.96rem' }}
                        >
                            {submitting ? "Uploading Video Reel to Kitchen Catalog…" : "Publish Reel to FoodReels"}
                        </button>
                    </div>
                </form>
            </div>

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

export default CreateFood;
