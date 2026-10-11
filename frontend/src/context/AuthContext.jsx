import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [foodPartner, setFoodPartner] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('foodreels_role') || null);
    const [token, setToken] = useState(localStorage.getItem('foodreels_token') || null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const storedRole = localStorage.getItem('foodreels_role');
        const storedToken = localStorage.getItem('foodreels_token');

        if (!storedToken && !document.cookie.includes('Token')) {
            setUser(null);
            setFoodPartner(null);
            setRole(null);
            setLoading(false);
            return;
        }

        try {
            if (storedRole === 'foodPartner') {
                const res = await authApi.getPartnerMe();
                setFoodPartner(res.data.foodPartner);
                setRole('foodPartner');
                setUser(null);
            } else {
                const res = await authApi.getUserMe();
                setUser(res.data.user);
                setRole('user');
                setFoodPartner(null);
            }
        } catch (err) {
            // If primary check failed, attempt alternative role before giving up
            try {
                if (storedRole === 'foodPartner') {
                    const userRes = await authApi.getUserMe();
                    setUser(userRes.data.user);
                    setRole('user');
                    localStorage.setItem('foodreels_role', 'user');
                } else {
                    const partnerRes = await authApi.getPartnerMe();
                    setFoodPartner(partnerRes.data.foodPartner);
                    setRole('foodPartner');
                    localStorage.setItem('foodreels_role', 'foodPartner');
                }
            } catch (fallbackErr) {
                // Clear state on invalid session
                localStorage.removeItem('foodreels_token');
                localStorage.removeItem('foodreels_role');
                setUser(null);
                setFoodPartner(null);
                setRole(null);
                setToken(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = (authToken, accountData, accountRole) => {
        if (authToken) {
            localStorage.setItem('foodreels_token', authToken);
            setToken(authToken);
        }
        localStorage.setItem('foodreels_role', accountRole);
        setRole(accountRole);

        if (accountRole === 'foodPartner') {
            setFoodPartner(accountData);
            setUser(null);
        } else {
            setUser(accountData);
            setFoodPartner(null);
        }
    };

    const logout = async () => {
        try {
            if (role === 'foodPartner') {
                await authApi.logoutPartner().catch(() => {});
            } else {
                await authApi.logoutUser().catch(() => {});
            }
        } finally {
            localStorage.removeItem('foodreels_token');
            localStorage.removeItem('foodreels_role');
            setUser(null);
            setFoodPartner(null);
            setRole(null);
            setToken(null);
        }
    };

    const value = {
        user,
        foodPartner,
        role,
        token,
        loading,
        isLoggedIn: Boolean(user || foodPartner),
        isPartner: role === 'foodPartner',
        isUser: role === 'user',
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
