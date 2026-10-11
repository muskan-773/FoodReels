import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';
import { UtensilsCrossed, User, Store, ArrowRight } from 'lucide-react';

const ChooseRegister = () => {
    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" role="region" aria-labelledby="choose-register-title">
                <header>
                    <div className="auth-brand-badge">
                        <UtensilsCrossed size={16} /> FoodReels
                    </div>
                    <h1 id="choose-register-title" className="auth-title">Join FoodReels</h1>
                    <p className="auth-subtitle">Select the membership experience tailored for you.</p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Link
                        to="/user/register"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            background: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            color: '#fff',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'rgba(226, 80, 55, 0.15)',
                                color: 'var(--color-primary)',
                                display: 'grid',
                                placeItems: 'center'
                            }}>
                                <User size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Foodie Discoverer</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    Watch reels, save favorites, get AI pairing recommendations
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} color="var(--color-text-muted)" />
                    </Link>

                    <Link
                        to="/food-partner/register"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            background: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            color: '#fff',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'rgba(223, 158, 56, 0.15)',
                                color: 'var(--color-accent-gold)',
                                display: 'grid',
                                placeItems: 'center'
                            }}>
                                <Store size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Kitchen Partner</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    Publish video reels, build your menu audience, generate AI descriptions
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} color="var(--color-text-muted)" />
                    </Link>
                </div>

                <div className="auth-alt-action" style={{ marginTop: '6px' }}>
                    Already have an account? <Link to="/user/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ChooseRegister;