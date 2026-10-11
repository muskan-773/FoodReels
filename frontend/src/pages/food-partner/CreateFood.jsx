import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../../styles/create-food.css';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { foodApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CUISINES = ['Italian', 'Indian', 'Japanese', 'Mexican', 'Asian', 'American', 'Bakery & Desserts', 'Healthy & Clean', 'Street Food'];
const DIETARY_TAG_OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free', 'High-Protein', 'Dessert', 'Cheesy'];

const CreateFood = () => {
    const { isPartner } = useAuth();
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
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const showToast = (message, type = 'info') => setToast({ message, type });

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // ── AI description generator ──────────────────────────────
    const generateDescription = async () => {
        if (!name.trim()) {
            showToast("Enter a food name first so AI knows what to describe.", "error");
            return;
        }
        setAiLoading(true);
        try {
            const response = await foodApi.generateDescription(name.trim(), cuisine);
            setDescription(response.data.description);
            showToast("Description generated with AI! Feel free to edit.", "success");
        } catch (err) {
            const msg = err.response?.data?.message || "AI generation failed. Please try again.";
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
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
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

            showToast("Food reel created successfully!", "success");
            setTimeout(() => navigate("/"), 1200);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create food. Please try again.";
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile || submitting, [name, videoFile, submitting]);

    return (
        <div className="create-food-page" style={{ paddingTop: '80px' }}>
            <div className="create-food-card">
                <header className="create-food-header">
                    <h1 className="create-food-title">Create Food Reel</h1>
                    <p className="create-food-subtitle">Upload a short video, give it a name, select tags, and generate an AI caption.</p>
                </header>

                <form className="create-food-form" onSubmit={onSubmit}>
                    {/* Video Upload Field */}
                    <div className="field-group">
                        <label htmlFor="foodVideo">Food Video <span aria-hidden="true">*</span></label>
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
                            aria-label="Upload video file"
                        >
                            <div className="file-dropzone-inner">
                                <svg className="file-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="currentColor" />
                                </svg>
                                <div className="file-dropzone-text">
                                    <strong>Tap to upload video</strong> or drag and drop
                                </div>
                                <div className="file-hint">MP4, WebM, MOV • Up to 100MB</div>
                            </div>
                        </div>

                        {fileError && <p className="error-text" role="alert">{fileError}</p>}

                        {videoFile && (
                            <div className="file-chip" aria-live="polite">
                                <span className="file-chip-name">{videoFile.name}</span>
                                <span className="file-chip-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
                                <div className="file-chip-actions">
                                    <button type="button" className="btn-ghost" onClick={openFileDialog}>Change</button>
                                    <button type="button" className="btn-ghost danger" onClick={() => { setVideoFile(null); setFileError(''); }}>Remove</button>
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
                        <label htmlFor="foodName">Dish Name <span aria-hidden="true">*</span></label>
                        <input
                            id="foodName"
                            type="text"
                            placeholder="e.g., Artisanal Truffle Mushroom Pizza"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                        />
                    </div>

                    {/* Cuisine & Price Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div className="field-group">
                            <label htmlFor="foodCuisine">Cuisine</label>
                            <select
                                id="foodCuisine"
                                value={cuisine}
                                onChange={(e) => setCuisine(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-surface-alt)',
                                    color: '#fff',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="field-group">
                            <label htmlFor="foodPrice">Price ($)</label>
                            <input
                                id="foodPrice"
                                type="number"
                                placeholder="e.g., 16"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min={0}
                                step={0.5}
                            />
                        </div>
                    </div>

                    {/* Dietary Tags */}
                    <div className="field-group">
                        <label>Dietary Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                            {DIETARY_TAG_OPTIONS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`badge-tag ${selectedTags.includes(tag) ? 'tag-spicy' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '6px 12px',
                                        fontSize: '0.8rem',
                                        background: selectedTags.includes(tag) ? 'rgba(255, 71, 87, 0.3)' : 'rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    {selectedTags.includes(tag) ? `✓ ${tag}` : `+ ${tag}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description with AI Assistant */}
                    <div className="field-group">
                        <div className="desc-label-row">
                            <label htmlFor="foodDesc">Description / Caption</label>
                            <button
                                type="button"
                                className="btn-ai"
                                onClick={generateDescription}
                                disabled={aiLoading || !name.trim()}
                                aria-label="Generate description with Gemini AI"
                            >
                                {aiLoading ? (
                                    <>
                                        <span className="btn-ai__spinner" aria-hidden="true" />
                                        Generating…
                                    </>
                                ) : (
                                    <>✨ Generate with Gemini</>
                                )}
                            </button>
                        </div>
                        <textarea
                            id="foodDesc"
                            rows={3}
                            placeholder="Write an appetizing description or click ✨ Generate with Gemini"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                        />
                    </div>

                    <div className="form-actions">
                        <button className="btn-primary" type="submit" disabled={isDisabled}>
                            {submitting ? "Uploading Video Reel…" : "Publish Food Reel"}
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
