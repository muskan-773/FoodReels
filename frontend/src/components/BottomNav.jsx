import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/bottom-nav.css';

const BottomNav = () => {
    const { isPartner, isLoggedIn } = useAuth();

    return (
        <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
            <div className="bottom-nav__inner">

                {/* Home Feed */}
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                >
                    <span className="bottom-nav__icon" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 10.5 12 3l9 7.5" />
                            <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
                        </svg>
                    </span>
                    <span className="bottom-nav__label">Feed</span>
                </NavLink>

                {/* Search & AI Cravings */}
                <NavLink
                    to="/search"
                    className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                >
                    <span className="bottom-nav__icon" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <span className="bottom-nav__label">AI Search</span>
                </NavLink>

                {/* Partner: Quick Upload Reel */}
                {isPartner ? (
                    <NavLink
                        to="/create-food"
                        className={({ isActive }) => `bottom-nav__item bottom-nav__item--upload ${isActive ? 'is-active' : ''}`}
                    >
                        <span className="bottom-nav__icon bottom-nav__icon--plus" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </span>
                        <span className="bottom-nav__label">Create</span>
                    </NavLink>
                ) : (
                    /* User/Guest: Saved Reels */
                    <NavLink
                        to="/saved"
                        className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                    >
                        <span className="bottom-nav__icon" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                            </svg>
                        </span>
                        <span className="bottom-nav__label">Saved</span>
                    </NavLink>
                )}

                {/* Account / Profile */}
                <NavLink
                    to={isLoggedIn ? "/profile" : "/user/login"}
                    className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                >
                    <span className="bottom-nav__icon" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </span>
                    <span className="bottom-nav__label">{isLoggedIn ? "Profile" : "Sign In"}</span>
                </NavLink>

            </div>
        </nav>
    );
};

export default BottomNav;
