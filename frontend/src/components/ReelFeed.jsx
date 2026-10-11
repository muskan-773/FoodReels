import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/reels.css';
import ShareSheet from './ShareSheet';

/* ── Individual reel ──────────────────────────────────────── */
const ReelItem = ({ item, onLike, onSave, isVisible, isMuted, onToggleMute }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(Boolean(item.isLiked));
  const [saved, setSaved] = useState(Boolean(item.isSaved));
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0);
  const [saveCount, setSaveCount] = useState(item.savesCount ?? 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Sync internal state if item props change (e.g. from server refresh)
  useEffect(() => {
    setLiked(Boolean(item.isLiked));
    setSaved(Boolean(item.isSaved));
    setLikeCount(item.likeCount ?? 0);
    setSaveCount(item.savesCount ?? 0);
  }, [item._id, item.isLiked, item.isSaved, item.likeCount, item.savesCount]);

  // Video playback sync with visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;

    if (isVisible) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setPaused(false)).catch(() => {
          // Auto-play was prevented (often happens unmuted on mobile)
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    } else {
      v.pause();
    }
  }, [isVisible, isMuted]);

  const lastTap = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    const isDouble = now - lastTap.current < 300;
    lastTap.current = now;

    if (isDouble) {
      if (!liked) {
        setLiked(true);
        setLikeCount(c => c + 1);
        onLike?.(item);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 900);
      }
      return;
    }

    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPaused(false)).catch(() => {});
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount(c => Math.max(0, c + (next ? 1 : -1)));
    onLike?.(item);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    setSaveCount(c => Math.max(0, c + (next ? 1 : -1)));
    onSave?.(item);
  };

  const partnerName = typeof item.foodPartner === 'object' ? item.foodPartner?.name : null;
  const partnerId = typeof item.foodPartner === 'object' ? item.foodPartner?._id : item.foodPartner;
  const partnerAddress = typeof item.foodPartner === 'object' ? item.foodPartner?.address : null;

  return (
    <section className="reel" role="listitem" data-id={item._id} id={`reel-${item._id}`}>

      {/* ── Desktop left info panel ── */}
      <div className="reel-side-info">
        {partnerId && (
          <Link to={`/food-partner/${partnerId}`} className="reel-side-avatar-link">
            <div className="reel-side-avatar">
              {(partnerName ?? 'R')[0].toUpperCase()}
            </div>
            <div className="reel-side-avatar-label">
              <span className="reel-side-restaurant">{partnerName ?? 'Partner Kitchen'}</span>
              <span className="reel-side-follow">{partnerAddress ? partnerAddress.split(',')[0] : 'View store profile →'}</span>
            </div>
          </Link>
        )}

        <h2 className="reel-side-name">{item.name}</h2>

        {/* Dietary / Cuisine Tags */}
        <div className="reel-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {item.cuisine && (
            <span className="badge-tag tag-cuisine">🍴 {item.cuisine}</span>
          )}
          {item.dietaryTags?.map(tag => (
            <span key={tag} className={`badge-tag ${tag.toLowerCase().includes('veg') ? 'tag-veg' : tag.toLowerCase().includes('spic') ? 'tag-spicy' : ''}`}>
              {tag}
            </span>
          ))}
          {item.price > 0 && (
            <span className="badge-tag" style={{ background: 'rgba(255,255,255,0.2)' }}>
              ${item.price}
            </span>
          )}
        </div>

        {item.description && (
          <p className="reel-side-desc">{item.description}</p>
        )}

        {partnerId && (
          <Link className="reel-side-btn" to={`/food-partner/${partnerId}`}>
            🍴 Visit store
          </Link>
        )}
      </div>

      {/* ── Video Column ── */}
      <div className="reel-video-wrap">
        <video
          ref={videoRef}
          className="reel-video"
          src={item.video}
          playsInline
          loop
          preload="metadata"
          onClick={handleTap}
          aria-label={item.name}
        />

        {/* Audio Mute/Unmute floating button */}
        <button
          className="reel-sound-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute?.();
          }}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          title={isMuted ? "Click to unmute" : "Click to mute"}
        >
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {paused && (
          <div className="reel-pause-icon" aria-hidden="true">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </div>
        )}

        {showHeart && (
          <div className="reel-heart-burst" aria-hidden="true">
            <svg width="90" height="90" viewBox="0 0 24 24" fill="#ff2d55">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </div>
        )}

        {/* Mobile overlay (shown only on mobile) */}
        <div className="reel-overlay">
          <div className="reel-overlay-gradient" aria-hidden="true" />
          <div className="reel-content">
            {partnerName && <p className="reel-username">@{partnerName}</p>}
            <p className="reel-name">{item.name}</p>

            {/* Tags on mobile */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '2px 0' }}>
              {item.cuisine && <span className="badge-tag tag-cuisine">🍴 {item.cuisine}</span>}
              {item.dietaryTags?.slice(0, 2).map(tag => (
                <span key={tag} className="badge-tag">{tag}</span>
              ))}
            </div>

            {item.description && <p className="reel-description">{item.description}</p>}

            {partnerId && (
              <Link
                className="reel-btn"
                to={`/food-partner/${partnerId}`}
                onClick={e => e.stopPropagation()}
              >
                🍴 Visit store
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Right-side action buttons ── */}
      <div className="reel-actions">
        {partnerId && (
          <Link
            to={`/food-partner/${partnerId}`}
            className="reel-avatar-link"
            onClick={e => e.stopPropagation()}
            title={partnerName || "Restaurant"}
          >
            <div className="reel-avatar">
              {(partnerName ?? 'R')[0].toUpperCase()}
            </div>
          </Link>
        )}

        <div className="reel-action-group">
          <button
            className={`reel-action ${liked ? 'is-active' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike reel' : 'Like reel'}
            aria-pressed={liked}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill={liked ? '#ff2d55' : 'none'}
              stroke={liked ? '#ff2d55' : 'white'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </button>
          <span className="reel-action__count">{likeCount}</span>
        </div>

        <div className="reel-action-group">
          <button
            className={`reel-action ${saved ? 'is-active' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Unsave reel' : 'Save reel'}
            aria-pressed={saved}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={saved ? '#ffa502' : 'none'}
              stroke={saved ? '#ffa502' : 'white'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </button>
          <span className="reel-action__count">{saveCount}</span>
        </div>

        <div className="reel-action-group">
          <button
            className="reel-action"
            aria-label="Share reel"
            onClick={e => {
              e.stopPropagation();
              setShowShare(true);
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <span className="reel-action__count">Share</span>
        </div>
      </div>

      {showShare && (
        <ShareSheet item={item} onClose={() => setShowShare(false)} />
      )}

    </section>
  );
};

/* ── Feed container ───────────────────────────────────────── */
const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No food reels yet.', highlightId = null }) => {
  const feedRef = useRef(null);
  const [visibleId, setVisibleId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // IntersectionObserver to auto-play whichever reel is actively centered
  useEffect(() => {
    if (items.length === 0) return;
    const sections = feedRef.current?.querySelectorAll('.reel');
    if (!sections) return;

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.55) {
          setVisibleId(e.target.dataset.id);
        }
      }),
      { threshold: 0.55 }
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Auto-scroll to highlight reel if provided via search query
  useEffect(() => {
    if (highlightId && items.length > 0) {
      const el = document.getElementById(`reel-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setVisibleId(highlightId);
      }
    } else if (items.length > 0 && !visibleId) {
      setVisibleId(items[0]._id);
    }
  }, [highlightId, items]);

  // Keyboard navigation: Arrow Up / Down, M for mute
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        const currentIndex = items.findIndex(item => item._id === visibleId);
        if (currentIndex < items.length - 1) {
          const nextEl = document.getElementById(`reel-${items[currentIndex + 1]._id}`);
          nextEl?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        const currentIndex = items.findIndex(item => item._id === visibleId);
        if (currentIndex > 0) {
          const prevEl = document.getElementById(`reel-${items[currentIndex - 1]._id}`);
          prevEl?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, visibleId, toggleMute]);

  return (
    <div className="reels-page">
      <div className="reels-feed" ref={feedRef} role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</span>
            <p style={{ fontWeight: 600 }}>{emptyMessage}</p>
          </div>
        )}
        {items.map(item => (
          <ReelItem
            key={item._id}
            item={item}
            onLike={onLike}
            onSave={onSave}
            isVisible={visibleId === item._id}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        ))}
      </div>
    </div>
  );
};

export default ReelFeed;
