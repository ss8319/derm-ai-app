'use client';

import { useEffect, useState } from 'react';
import CaseCard from '../components/CaseCard';
import { Case } from '../types/case';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Admins see all cases, clinicians see only assigned cases
        const endpoint = isAdmin() ? '/cases' : '/assignments/my-cases';
        const data = await apiFetch<Case[]>(endpoint);
        setCases(data);
      } catch (err) {
        setError('Failed to load cases. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DermAI Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name || 'Clinician'}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-500">Active Session</span>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new case.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
