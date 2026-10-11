import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, User, Store, ArrowRight, Sparkles } from 'lucide-react';

const UserLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fillDemoUser = () => {
        setEmail('foodie@example.com');
        setPassword('password123');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailVal = email.trim();
        const passVal = password;

        if (!emailVal || !passVal) {
            setError("Email and password are required.");
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.loginUser({ email: emailVal, password: passVal });
            login(res.data.token, res.data.user, 'user');
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="user-login-title">
                <header>
                    <div className="auth-brand-badge">
                        <UtensilsCrossed size={16} /> FoodReels
                    </div>
                    <h1 id="user-login-title" className="auth-title">Welcome back, Foodie</h1>
                    <p className="auth-subtitle">Sign in to discover, like, and save artisanal food reels.</p>
                </header>

                {/* Role Switcher Tabs */}
                <div className="auth-role-tabs">
                    <div className="auth-role-tab active">
                        <User size={14} /> Foodie Member
                    </div>
                    <Link to="/food-partner/login" className="auth-role-tab">
                        <Store size={14} /> Kitchen Partner
                    </Link>
                </div>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                {/* Demo Helper */}
                <div className="demo-pill-wrap">
                    <div className="demo-pill-header">
                        <span>Quick Demo Sign-in</span>
                        <Sparkles size={12} color="var(--color-accent-gold)" />
                    </div>
                    <button
                        type="button"
                        className="demo-pill-btn"
                        onClick={fillDemoUser}
                    >
                        Auto-fill: foodie@example.com
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@domain.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign In to FoodReels"}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New to FoodReels? <Link to="/user/register">Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
