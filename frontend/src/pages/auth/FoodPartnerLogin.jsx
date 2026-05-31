import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const FoodPartnerLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        try {
            await axios.post("http://localhost:3001/api/auth/food-partner/login", {
                email,
                password
            }, { withCredentials: true });

            navigate("/create-food");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="partner-login-title">
                <header>
                    <h1 id="partner-login-title" className="auth-title">Partner login</h1>
                    <p className="auth-subtitle">Access your dashboard and manage your food reels.</p>
                </header>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="business@example.com"
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
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New partner? <Link to="/food-partner/register">Create an account</Link>
                </div>
                <div className="auth-alt-action">
                    A regular user? <Link to="/user/login">User login</Link>
                </div>
            </div>
        </div>
    );
};

export default FoodPartnerLogin;
