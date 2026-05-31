import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UserLogin = () => {
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
            await axios.post("http://localhost:3001/api/auth/user/login", {
                email,
                password
            }, { withCredentials: true });

            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="user-login-title">
                <header>
                    <h1 id="user-login-title" className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to continue your food journey.</p>
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
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    New here? <Link to="/user/register">Create account</Link>
                </div>
                <div className="auth-alt-action">
                    A food partner? <Link to="/food-partner/login">Partner login</Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
