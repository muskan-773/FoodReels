import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Share2, Volume2, VolumeX, Store, ArrowRight, Pause, Play } from 'lucide-react';
import '../styles/reels.css';
import ShareSheet from './ShareSheet';

/* ── Individual Reel Item ─────────────────────────────────── */
const ReelItem = ({ item, onLike, onSave, isVisible, isMuted, onToggleMute }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(Boolean(item.isLiked));
  const [saved, setSaved] = useState(Boolean(item.isSaved));
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0);
  const [saveCount, setSaveCount] = useState(item.savesCount ?? 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync state if props change from parent
  useEffect(() => {
    setLiked(Boolean(item.isLiked));
    setSaved(Boolean(item.isSaved));
    setLikeCount(item.likeCount ?? 0);
    setSaveCount(item.savesCount ?? 0);
  }, [item._id, item.isLiked, item.isSaved, item.likeCount, item.savesCount]);

  // Handle video playback
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;

    if (isVisible) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPaused(false))
          .catch(() => {
            // Autoplay unmuted restriction fallback
            v.muted = true;
            v.play().catch(() => {});
          });
      }
    } else {
      v.pause();
    }
  }, [isVisible, isMuted]);

  // Video progress tracker
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const lastTap = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    const isDouble = now - lastTap.current < 280;
    lastTap.current = now;

    if (isDouble) {
      if (!liked) {
        setLiked(true);
        setLikeCount(c => c + 1);
        onLike?.(item);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 850);
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

      {/* ── Left Editorial Storyboard (Desktop) ── */}
      <div className="reel-side-info">
        {partnerId && (
          <Link to={`/food-partner/${partnerId}`} className="reel-side-avatar-link" title="View Restaurant Profile">
            <div className="reel-side-avatar">
              {(partnerName ?? 'R')[0].toUpperCase()}
            </div>
            <div className="reel-side-avatar-label">
              <span className="reel-side-restaurant">{partnerName ?? 'Artisanal Kitchen'}</span>
              <span className="reel-side-follow">{partnerAddress ? partnerAddress.split(',')[0] : 'Curated Storefront →'}</span>
            </div>
          </Link>
        )}

        <div>
          <span className="reel-side-tasting-label">Featured Dish</span>
          <h2 className="reel-side-name">{item.name}</h2>
        </div>

        {/* Refined Taste Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {item.cuisine && (
            <span className="badge-pill badge-pill--gold">{item.cuisine}</span>
          )}
          {item.dietaryTags?.map(tag => {
            const isVeg = tag.toLowerCase().includes('veg');
            const isSpicy = tag.toLowerCase().includes('spic');
            return (
              <span key={tag} className={`badge-pill ${isVeg ? 'badge-pill--green' : isSpicy ? 'badge-pill--primary' : ''}`}>
                {tag}
              </span>
            );
          })}
          {item.price > 0 && (
            <span className="badge-pill badge-pill--price">${item.price}</span>
          )}
        </div>

        {item.description && (
          <div>
            <p className="reel-side-desc">{item.description}</p>
          </div>
        )}

        {partnerId && (
          <Link className="reel-side-btn" to={`/food-partner/${partnerId}`}>
            <Store size={15} />
            <span>Visit Kitchen</span>
            <ArrowRight size={14} style={{ opacity: 0.7 }} />
          </Link>
        )}
      </div>

      {/* ── Center Video Viewport ── */}
      <div className="reel-video-wrap">
        <video
          ref={videoRef}
          className="reel-video"
          src={item.video}
          playsInline
          loop
          preload="metadata"
          onClick={handleTap}
          onTimeUpdate={handleTimeUpdate}
          aria-label={item.name}
        />

        {/* Video Duration Timeline Fill */}
        <div className="reel-progress-bar" aria-hidden="true">
          <div className="reel-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Refined Sound Toggle */}
        <button
          className="reel-sound-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute?.();
          }}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          title={isMuted ? "Click to unmute" : "Click to mute"}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Minimalist Pause Overlay */}
        {paused && (
          <div className="reel-pause-icon" aria-hidden="true">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(12, 14, 18, 0.75)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Play size={26} fill="white" strokeWidth={0} style={{ marginLeft: '3px' }} />
            </div>
          </div>
        )}

        {/* Double Tap Heart Burst */}
        {showHeart && (
          <div className="reel-heart-burst" aria-hidden="true">
            <Heart size={84} fill="var(--color-primary)" color="var(--color-primary)" strokeWidth={1} />
          </div>
        )}

        {/* Mobile Viewport Overlay */}
        <div className="reel-overlay">
          <div className="reel-overlay-gradient" aria-hidden="true" />
          <div className="reel-content">
            {partnerName && <span className="reel-username">@{partnerName}</span>}
            <h2 className="reel-name">{item.name}</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '2px 0' }}>
              {item.cuisine && <span className="badge-pill badge-pill--gold">{item.cuisine}</span>}
              {item.dietaryTags?.slice(0, 2).map(tag => (
                <span key={tag} className="badge-pill">{tag}</span>
              ))}
              {item.price > 0 && <span className="badge-pill badge-pill--price">${item.price}</span>}
            </div>

            {item.description && <p className="reel-description">{item.description}</p>}

            {partnerId && (
              <Link
                className="reel-btn"
                to={`/food-partner/${partnerId}`}
                onClick={e => e.stopPropagation()}
              >
                <Store size={13} />
                <span>Visit Storefront</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Right-Side Actions ── */}
      <div className="reel-actions">
        {partnerId && (
          <Link
            to={`/food-partner/${partnerId}`}
            className="reel-avatar-link"
            onClick={e => e.stopPropagation()}
            title={partnerName || "Restaurant Storefront"}
          >
            <div className="reel-avatar">
              {(partnerName ?? 'R')[0].toUpperCase()}
            </div>
          </Link>
        )}

        {/* Like Button */}
        <div className="reel-action-group">
          <button
            className={`reel-action ${liked ? 'is-liked' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike dish' : 'Like dish'}
            aria-pressed={liked}
          >
            <Heart
              size={21}
              fill={liked ? 'var(--color-primary)' : 'none'}
              strokeWidth={liked ? 0 : 2.2}
            />
          </button>
          <span className="reel-action__count">{likeCount}</span>
        </div>

        {/* Save Button */}
        <div className="reel-action-group">
          <button
            className={`reel-action ${saved ? 'is-saved' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Unsave dish' : 'Save dish'}
            aria-pressed={saved}
          >
            <Bookmark
              size={20}
              fill={saved ? 'var(--color-accent-gold)' : 'none'}
              strokeWidth={saved ? 0 : 2.2}
            />
          </button>
          <span className="reel-action__count">{saveCount}</span>
        </div>

        {/* Share Button */}
        <div className="reel-action-group">
          <button
            className="reel-action"
            aria-label="Share dish"
            onClick={e => {
              e.stopPropagation();
              setShowShare(true);
            }}
          >
            <Share2 size={19} strokeWidth={2.2} />
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

/* ── Feed Container ───────────────────────────────────────── */
const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No culinary reels yet.', highlightId = null }) => {
  const feedRef = useRef(null);
  const [visibleId, setVisibleId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // IntersectionObserver to auto-play whichever reel is actively visible
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

  // Auto-scroll to highlighted reel if selected from search/discovery
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

  // Keyboard controls
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
            <h3 className="font-editorial" style={{ fontSize: '1.6rem', marginBottom: '8px' }}>The Kitchen is Preparing</h3>
            <p style={{ maxWidth: '360px', margin: '0 auto', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {emptyMessage}
            </p>
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
