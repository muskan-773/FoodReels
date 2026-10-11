import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth-shared.css';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const firstName = e.target.firstName.value.trim();
        const lastName = e.target.lastName.value.trim();
        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        if (!firstName || !email || !password) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.registerUser({
                fullName: `${firstName} ${lastName}`.trim(),
                email,
                password
            });

            login(res.data.token, res.data.user, 'user');
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="user-register-title">
                <header>
                    <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>🍔</div>
                    <h1 id="user-register-title" className="auth-title">Create your foodie account</h1>
                    <p className="auth-subtitle">Join to discover, rate, and save delicious meals near you.</p>
                </header>

                <nav className="auth-alt-action" style={{ marginTop: '-4px' }}>
                    <strong style={{ fontWeight: 600 }}>Switch Role:</strong>{' '}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Foodie User</span> •{' '}
                    <Link to="/food-partner/register">Restaurant Partner</Link>
                </nav>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="two-col">
                        <div className="field-group">
                            <label htmlFor="firstName">First Name</label>
                            <input id="firstName" name="firstName" placeholder="Jane" autoComplete="given-name" required />
                        </div>
                        <div className="field-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input id="lastName" name="lastName" placeholder="Doe" autoComplete="family-name" />
                        </div>
                    </div>
                    <div className="field-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                    </div>
                    <div className="field-group">
                        <label htmlFor="password">Password (min 6 chars)</label>
                        <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required minLength={6} />
                    </div>
                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Creating account…" : "Sign Up"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    Already have an account? <Link to="/user/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;
