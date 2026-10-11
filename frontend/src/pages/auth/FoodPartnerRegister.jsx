import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth-shared.css';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FoodPartnerRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const businessName = e.target.businessName.value.trim();
        const contactName = e.target.contactName.value.trim();
        const phone = e.target.phone.value.trim();
        const email = e.target.email.value.trim();
        const password = e.target.password.value;
        const address = e.target.address.value.trim();

        if (!businessName || !contactName || !phone || !email || !password || !address) {
            setError("All fields are required to register a food partner.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.registerPartner({
                name: businessName,
                contactName,
                phone,
                email,
                password,
                address
            });

            login(res.data.token, res.data.foodPartner, 'foodPartner');
            navigate("/create-food");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="partner-register-title">
                <header>
                    <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>🍴</div>
                    <h1 id="partner-register-title" className="auth-title">Partner Sign Up</h1>
                    <p className="auth-subtitle">Showcase your culinary masterpieces to thousands of local foodies.</p>
                </header>

                <nav className="auth-alt-action" style={{ marginTop: '-4px' }}>
                    <strong style={{ fontWeight: 600 }}>Switch Role:</strong>{' '}
                    <Link to="/user/register">Foodie User</Link> •{' '}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Restaurant Partner</span>
                </nav>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="businessName">Restaurant / Business Name</label>
                        <input id="businessName" name="businessName" placeholder="e.g. Bella Napoli Pizzeria" autoComplete="organization" required />
                    </div>
                    <div className="two-col">
                        <div className="field-group">
                            <label htmlFor="contactName">Owner / Manager Name</label>
                            <input id="contactName" name="contactName" placeholder="Jane Doe" autoComplete="name" required />
                        </div>
                        <div className="field-group">
                            <label htmlFor="phone">Business Phone</label>
                            <input id="phone" name="phone" placeholder="+1 555-019-2831" autoComplete="tel" required />
                        </div>
                    </div>
                    <div className="field-group">
                        <label htmlFor="email">Business Email</label>
                        <input id="email" name="email" type="email" placeholder="contact@restaurant.com" autoComplete="email" required />
                    </div>
                    <div className="field-group">
                        <label htmlFor="password">Password (min 6 chars)</label>
                        <input id="password" name="password" type="password" placeholder="Create password" autoComplete="new-password" required minLength={6} />
                    </div>
                    <div className="field-group">
                        <label htmlFor="address">Physical Address (for customer store visits)</label>
                        <input id="address" name="address" placeholder="123 Market Street, New York, NY" autoComplete="street-address" required />
                    </div>
                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Creating partner account…" : "Register Food Partner Account"}
                    </button>
                </form>

                <div className="auth-alt-action">
                    Already a registered partner? <Link to="/food-partner/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default FoodPartnerRegister;
