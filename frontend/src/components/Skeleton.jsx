import React from 'react';
import '../styles/skeleton.css';

/**
 * Full-screen skeleton loader that mimics the reels feed layout.
 */
const Skeleton = () => {
    return (
        <div className="skeleton-page" aria-busy="true" aria-label="Loading content">
            <div className="skeleton-reel">
                {/* Simulated video background */}
                <div className="skeleton-video skeleton-pulse" />

                {/* Right-side action buttons */}
                <div className="skeleton-actions">
                    <div className="skeleton-action-btn skeleton-pulse" />
                    <div className="skeleton-action-count skeleton-pulse" />
                    <div className="skeleton-action-btn skeleton-pulse" />
                    <div className="skeleton-action-count skeleton-pulse" />
                    <div className="skeleton-action-btn skeleton-pulse" />
                    <div className="skeleton-action-count skeleton-pulse" />
                </div>

                {/* Bottom content */}
                <div className="skeleton-content">
                    <div className="skeleton-line skeleton-pulse" style={{ width: '70%' }} />
                    <div className="skeleton-line skeleton-pulse" style={{ width: '50%' }} />
                    <div className="skeleton-btn skeleton-pulse" />
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
