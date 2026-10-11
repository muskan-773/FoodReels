import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserLogin = () => {
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
            const res = await authApi.loginUser({ email, password });
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
                    <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>🍔</div>
                    <h1 id="user-login-title" className="auth-title">Welcome back, Foodie</h1>
                    <p className="auth-subtitle">Sign in to discover, like, and save mouthwatering reels.</p>
                </header>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
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
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign In to FoodReels"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New to FoodReels? <Link to="/user/register">Create account</Link>
                </div>
                <div className="auth-alt-action">
                    Are you a restaurant? <Link to="/food-partner/login">Food Partner Login →</Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
