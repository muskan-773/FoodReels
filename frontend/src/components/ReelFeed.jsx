import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/reels.css'
import ShareSheet from './ShareSheet'

/* ── Individual reel ──────────────────────────────────────── */
const ReelItem = ({ item, onLike, onSave, isVisible }) => {
  const videoRef = useRef(null)
  const [paused, setPaused]     = useState(false)
  const [liked, setLiked]       = useState(false)
  const [saved, setSaved]       = useState(false)
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0)
  const [saveCount, setSaveCount] = useState(item.savesCount ?? 0)
  const [showHeart, setShowHeart] = useState(false)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isVisible) { v.play().catch(() => {}); setPaused(false) }
    else v.pause()
  }, [isVisible])

  const lastTap = useRef(0)
  const handleTap = () => {
    const now = Date.now()
    const isDouble = now - lastTap.current < 300
    lastTap.current = now
    if (isDouble) {
      if (!liked) {
        setLiked(true); setLikeCount(c => c + 1); onLike?.(item)
        setShowHeart(true); setTimeout(() => setShowHeart(false), 900)
      }
      return
    }
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPaused(false) }
    else          { v.pause(); setPaused(true) }
  }

  const handleLike = (e) => {
    e.stopPropagation()
    const next = !liked
    setLiked(next); setLikeCount(c => Math.max(0, c + (next ? 1 : -1))); onLike?.(item)
  }
  const handleSave = (e) => {
    e.stopPropagation()
    const next = !saved
    setSaved(next); setSaveCount(c => Math.max(0, c + (next ? 1 : -1))); onSave?.(item)
  }

  const partnerName = typeof item.foodPartner === 'object' ? item.foodPartner?.name : null
  const partnerId   = typeof item.foodPartner === 'object' ? item.foodPartner?._id  : item.foodPartner

  return (
    <section className="reel" role="listitem" data-id={item._id}>

      {/* ── Desktop left info panel ── */}
      <div className="reel-side-info">
        {partnerId && (
          <Link to={`/food-partner/${partnerId}`} className="reel-side-avatar-link">
            <div className="reel-side-avatar">
              {(partnerName ?? 'R')[0].toUpperCase()}
            </div>
            <div className="reel-side-avatar-label">
              <span className="reel-side-restaurant">{partnerName ?? 'Restaurant'}</span>
              <span className="reel-side-follow">View profile →</span>
            </div>
          </Link>
        )}

        <h2 className="reel-side-name">{item.name}</h2>

        {item.description && (
          <p className="reel-side-desc">{item.description}</p>
        )}

        {partnerId && (
          <Link className="reel-side-btn" to={`/food-partner/${partnerId}`}>
            🍴 Visit store
          </Link>
        )}
      </div>

      {/* ── Video ── */}
      <div className="reel-video-wrap">
        <video
          ref={videoRef}
          className="reel-video"
          src={item.video}
          muted playsInline loop preload="metadata"
          onClick={handleTap}
          aria-label={item.name}
        />

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
            {item.description && <p className="reel-description">{item.description}</p>}
            {partnerId && (
              <Link className="reel-btn" to={`/food-partner/${partnerId}`}
                onClick={e => e.stopPropagation()}>
                🍴 Visit store
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Right-side action buttons ── */}
      <div className="reel-actions">
        {partnerId && (
          <Link to={`/food-partner/${partnerId}`} className="reel-avatar-link"
            onClick={e => e.stopPropagation()}>
            <div className="reel-avatar">
              {(partnerName ?? 'R')[0].toUpperCase()}
            </div>
          </Link>
        )}

        <div className="reel-action-group">
          <button className="reel-action" onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'} aria-pressed={liked}>
            <svg width="26" height="26" viewBox="0 0 24 24"
              fill={liked ? '#ff2d55' : 'none'}
              stroke={liked ? '#ff2d55' : 'white'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </button>
          <span className="reel-action__count">{likeCount}</span>
        </div>

        <div className="reel-action-group">
          <button className="reel-action" onClick={handleSave}
            aria-label={saved ? 'Unsave' : 'Save'} aria-pressed={saved}>
            <svg width="24" height="24" viewBox="0 0 24 24"
              fill={saved ? 'white' : 'none'}
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </button>
          <span className="reel-action__count">{saveCount}</span>
        </div>

        <div className="reel-action-group">
          <button className="reel-action" aria-label="Share"
            onClick={e => { e.stopPropagation(); setShowShare(true) }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
          <span className="reel-action__count">Share</span>
        </div>
      </div>

      {showShare && (
        <ShareSheet item={item} onClose={() => setShowShare(false)} />
      )}

    </section>
  )
}

/* ── Feed container ───────────────────────────────────────── */
const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const feedRef   = useRef(null)
  const [visibleId, setVisibleId] = useState(null)

  const handleScroll = () => {
    const el = feedRef.current
    if (!el || items.length === 0) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop + clientHeight >= scrollHeight - 2) {
      el.style.scrollBehavior = 'auto'
      el.scrollTop = 0
      el.style.scrollBehavior = ''
    }
  }

  useEffect(() => {
    if (items.length === 0) return
    const sections = feedRef.current?.querySelectorAll('.reel')
    if (!sections) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6)
          setVisibleId(e.target.dataset.id)
      }),
      { threshold: 0.6 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [items])

  return (
    <div className="reels-page">
      <div className="reels-feed" ref={feedRef} role="list" onScroll={handleScroll}>
        {items.length === 0 && (
          <div className="empty-state"><p>{emptyMessage}</p></div>
        )}
        {items.map(item => (
          <ReelItem key={item._id} item={item}
            onLike={onLike} onSave={onSave}
            isVisible={visibleId === item._id} />
        ))}
      </div>
    </div>
  )
}

export default ReelFeed
