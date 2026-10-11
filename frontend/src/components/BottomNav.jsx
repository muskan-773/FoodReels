import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, Bookmark, Plus, User as UserIcon } from 'lucide-react';
import '../styles/bottom-nav.css';

const BottomNav = () => {
    const { isPartner, isLoggedIn } = useAuth();

    return (
        <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
            <div className="bottom-nav__inner">

                {/* Feed */}
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                >
                    <span className="bottom-nav__icon">
                        <Flame size={20} strokeWidth={2.2} />
                    </span>
                    <span className="bottom-nav__label">Feed</span>
                </NavLink>

                {/* AI Sommelier */}
                <NavLink
                    to="/search"
                    className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                >
                    <span className="bottom-nav__icon">
                        <Sparkles size={20} strokeWidth={2.2} />
                    </span>
                    <span className="bottom-nav__label">Discover</span>
                </NavLink>

                {/* Partner: Create Reel / User: Saved */}
                {isPartner ? (
                    <NavLink
                        to="/create-food"
                        className={({ isActive }) => `bottom-nav__item bottom-nav__item--upload ${isActive ? 'is-active' : ''}`}
                    >
                        <span className="bottom-nav__icon bottom-nav__icon--plus">
                            <Plus size={20} strokeWidth={2.8} />
                        </span>
                        <span className="bottom-nav__label">Publish</span>
                    </NavLink>
                ) : (
                    <NavLink
                        to="/saved"
                        className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                    >
                        <span className="bottom-nav__icon">
                            <Bookmark size={19} strokeWidth={2.2} />
                        </span>
                        <span className="bottom-nav__label">Saved</span>
                    </NavLink>
                )}

                {/* Profile */}
                <NavLink
                    to={isLoggedIn ? "/profile" : "/user/login"}
                    className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
                >
                    <span className="bottom-nav__icon">
                        <UserIcon size={20} strokeWidth={2.2} />
                    </span>
                    <span className="bottom-nav__label">{isLoggedIn ? "Account" : "Sign In"}</span>
                </NavLink>

            </div>
        </nav>
    );
};

export default BottomNav;
