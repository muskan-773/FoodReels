import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/top-nav.css';

const TopNav = () => {
    const { user, foodPartner, isPartner, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const displayName = isPartner
        ? foodPartner?.name || 'Restaurant'
        : user?.fullName || 'User';

    const initials = displayName.charAt(0).toUpperCase();

    return (
        <header className="top-nav" role="banner">
            <div className="top-nav__container">
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to="/" className="top-nav__brand">
                        <span className="top-nav__logo-icon">🍔</span>
                        <span className="top-nav__logo-text">FoodReels</span>
                    </Link>
                    <span className="top-nav__badge">AI Powered</span>
                </div>

                {/* Desktop navigation links */}
                <nav className="top-nav__links" aria-label="Main navigation">
                    <NavLink to="/" end className={({ isActive }) => `top-nav__link ${isActive ? 'active' : ''}`}>
                        <span>🔥 Feed</span>
                    </NavLink>
                    <NavLink to="/search" className={({ isActive }) => `top-nav__link top-nav__link--ai ${isActive ? 'active' : ''}`}>
                        <span>✨ AI Cravings</span>
                    </NavLink>
                    <NavLink to="/saved" className={({ isActive }) => `top-nav__link ${isActive ? 'active' : ''}`}>
                        <span>🔖 Saved</span>
                    </NavLink>
                </nav>

                {/* Right side actions */}
                <div className="top-nav__actions">
                    {isPartner && (
                        <Link to="/create-food" className="top-nav__btn-upload">
                            <span>➕</span>
                            <span>Upload Reel</span>
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/profile" className="top-nav__avatar-btn" title="View Profile">
                                <div className="top-nav__avatar-circle">
                                    {initials}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'none', md: 'inline' }}>
                                    {displayName.split(' ')[0]}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="top-nav__btn-signin"
                                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                                title="Sign out"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to="/user/login" className="top-nav__btn-signin">
                                Sign In
                            </Link>
                            <Link to="/food-partner/login" className="top-nav__btn-signin" style={{ display: 'none', sm: 'inline-flex' }}>
                                Partners
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopNav;
