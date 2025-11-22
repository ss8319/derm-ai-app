'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout, isAuthenticated, isAdmin, isResearcher } = useAuth();

    return (
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
                DermAI
            </Link>
            {isAuthenticated && (
                <div className="flex items-center space-x-4">
                    {(isAdmin() || isResearcher()) && (
                        <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">
                            Admin Dashboard
                        </Link>
                    )}
                    <span className="text-gray-700">Hi, {user?.name || 'Clinician'}</span>
                    <button
                        onClick={logout}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}
