import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FoodPartnerLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        if (!email || !password) {
            setError("Email and password are required.");
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.loginPartner({ email, password });
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
                    <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>🍴</div>
                    <h1 id="partner-login-title" className="auth-title">Partner Kitchen Portal</h1>
                    <p className="auth-subtitle">Access your restaurant dashboard and upload food reels.</p>
                </header>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Business Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="business@restaurant.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign In to Partner Portal"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New restaurant partner? <Link to="/food-partner/register">Register your kitchen</Link>
                </div>
                <div className="auth-alt-action">
                    Are you a regular user? <Link to="/user/login">Foodie User Login →</Link>
                </div>
            </div>
        </div>
    );
};

export default FoodPartnerLogin;
