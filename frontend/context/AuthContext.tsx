'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: () => boolean;
    isResearcher: () => boolean;
    isClinician: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const storedToken = Cookies.get('token');
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                // In a real app, we might verify the token with the backend here
                // For now, we'll trust the token if it's valid JWT
                setToken(storedToken);
                // We can decode user info from token if included, or fetch profile
                // For simplicity, we'll just set basic info from token payload if available
                setUser({
                    id: decoded.sub,
                    email: decoded.email,
                    role: decoded.role,
                    name: decoded.name || 'Clinician'
                });
            } catch (error) {
                console.error('Invalid token:', error);
                Cookies.remove('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        Cookies.set('token', newToken, { expires: 1 }); // Expires in 1 day
        setToken(newToken);
        setUser(newUser);
        router.push('/');
    };

    const logout = () => {
        Cookies.remove('token');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const isAdmin = () => user?.role === 'admin';
    const isResearcher = () => user?.role === 'researcher' || user?.role === 'admin';
    const isClinician = () => user?.role === 'clinician';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading,
            isAdmin,
            isResearcher,
            isClinician,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
