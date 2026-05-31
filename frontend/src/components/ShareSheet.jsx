import React, { useEffect, useRef, useState } from 'react'
import '../styles/share-sheet.css'

/**
 * ShareSheet — bottom-sheet style share menu
 * Props:
 *   item     – { name, _id }
 *   onClose  – callback to close
 */
const ShareSheet = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false)
  const sheetRef = useRef(null)

  // close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // trap focus
  useEffect(() => {
    sheetRef.current?.querySelector('button')?.focus()
  }, [])

  const shareUrl = `${window.location.origin}/video/${item._id}`
  const shareText = `Check out "${item.name}" on FoodReels!`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('input')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOptions = [
    {
      label: 'WhatsApp',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L.057 23.428a.5.5 0 0 0 .609.61l5.699-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.204-1.43l-.373-.22-3.862.99 1.01-3.77-.242-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      label: 'Twitter / X',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'Telegram',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#229ED9">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.5l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.06z"/>
        </svg>
      ),
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ]

  return (
    <div className="share-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Share">
      <div className="share-sheet" ref={sheetRef}>
        <div className="share-sheet__handle" aria-hidden="true" />

        <h2 className="share-sheet__title">Share this reel</h2>
        <p className="share-sheet__food-name">{item.name}</p>

        {/* App share buttons */}
        <div className="share-apps">
          {shareOptions.map(opt => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="share-app-btn"
              onClick={onClose}
            >
              <span className="share-app-icon">{opt.icon}</span>
              <span className="share-app-label">{opt.label}</span>
            </a>
          ))}
        </div>

        <div className="share-divider"><span>or copy link</span></div>

        {/* Copy link row */}
        <div className="share-copy-row">
          <span className="share-copy-url">{shareUrl}</span>
          <button className={`share-copy-btn ${copied ? 'share-copy-btn--copied' : ''}`} onClick={copyLink}>
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <button className="share-close-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default ShareSheet
