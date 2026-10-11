import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, User, Store, ArrowRight, Sparkles } from 'lucide-react';

const FoodPartnerLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fillDemoChef = () => {
        setEmail('marco@bellanapoli.com');
        setPassword('password123');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailVal = email.trim();
        const passVal = password;

        if (!emailVal || !passVal) {
            setError("Business email and password are required.");
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.loginPartner({ email: emailVal, password: passVal });
            login(res.data.token, res.data.foodPartner, 'foodPartner');
            navigate("/create-food");
        } catch (err) {
            setError(err.response?.data?.message || "Partner login failed. Please verify credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="partner-login-title">
                <header>
                    <div className="auth-brand-badge">
                        <UtensilsCrossed size={16} /> FoodReels
                    </div>
                    <h1 id="partner-login-title" className="auth-title">Partner Kitchen Portal</h1>
                    <p className="auth-subtitle">Manage your culinary video catalog and reach diners.</p>
                </header>

                {/* Role Switcher Tabs */}
                <div className="auth-role-tabs">
                    <Link to="/user/login" className="auth-role-tab">
                        <User size={14} /> Foodie Member
                    </Link>
                    <div className="auth-role-tab active">
                        <Store size={14} /> Kitchen Partner
                    </div>
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
                        onClick={fillDemoChef}
                    >
                        Auto-fill: marco@bellanapoli.com
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Business Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="chef@restaurant.com"
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
                        {loading ? "Signing in…" : "Sign In to Kitchen Portal"}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New restaurant partner? <Link to="/food-partner/register">Register your kitchen</Link>
                </div>
            </div>
        </div>
    );
};

export default FoodPartnerLogin;
