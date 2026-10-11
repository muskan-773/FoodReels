import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, Bookmark, Plus, Store, LogOut, User as UserIcon, UtensilsCrossed } from 'lucide-react';
import '../styles/top-nav.css';

const TopNav = () => {
    const { user, foodPartner, isPartner, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const displayName = isPartner
        ? foodPartner?.name || 'Kitchen'
        : user?.fullName || 'Foodie';

    const initials = displayName.charAt(0).toUpperCase();

    return (
        <header className="top-nav" role="banner">
            <div className="top-nav__container">
                {/* Brand Monogram & Name */}
                <Link to="/" className="top-nav__brand" title="FoodReels Home">
                    <div className="top-nav__logo-mark" aria-hidden="true">
                        <UtensilsCrossed size={17} strokeWidth={2.2} />
                    </div>
                    <div className="top-nav__brand-title">
                        <span className="top-nav__logo-text">FoodReels</span>
                        <span className="top-nav__logo-sub">Curated Gastronomy</span>
                    </div>
                </Link>

                {/* Primary Editorial Navigation */}
                <nav className="top-nav__links" aria-label="Main navigation">
                    <NavLink to="/" end className={({ isActive }) => `top-nav__link ${isActive ? 'active' : ''}`}>
                        <Flame size={15} strokeWidth={2.2} />
                        <span>The Feed</span>
                    </NavLink>
                    <NavLink to="/search" className={({ isActive }) => `top-nav__link top-nav__link--ai ${isActive ? 'active' : ''}`}>
                        <Sparkles size={15} strokeWidth={2.2} />
                        <span>AI Sommelier</span>
                    </NavLink>
                    <NavLink to="/saved" className={({ isActive }) => `top-nav__link ${isActive ? 'active' : ''}`}>
                        <Bookmark size={15} strokeWidth={2.2} />
                        <span>Saved Dishes</span>
                    </NavLink>
                </nav>

                {/* Right Side Controls */}
                <div className="top-nav__actions">
                    {isPartner && (
                        <Link to="/create-food" className="top-nav__btn-upload">
                            <Plus size={15} strokeWidth={2.5} />
                            <span>Publish Reel</span>
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to="/profile" className="top-nav__user-pill" title="View Account">
                                <div className="top-nav__avatar">
                                    {initials}
                                </div>
                                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {displayName.split(' ')[0]}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="top-nav__btn-signin"
                                style={{ padding: '7px 10px', color: 'var(--color-text-muted)' }}
                                title="Sign out"
                                aria-label="Log out"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to="/user/login" className="top-nav__btn-signin">
                                Sign In
                            </Link>
                            <Link to="/food-partner/login" className="top-nav__btn-partner" title="Restaurant & Partner Portal">
                                <Store size={14} />
                                <span>Kitchen Portal</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopNav;
