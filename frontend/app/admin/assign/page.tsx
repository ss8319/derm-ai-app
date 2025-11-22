'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Case {
    id: string;
    patientId: string;
    chiefComplaint: string;
}

interface Assignment {
    id: string;
    caseId: string;
    userId: string;
    status: string;
}

export default function AssignmentPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedCase, setSelectedCase] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { isAdmin, isResearcher } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, casesData, assignmentsData] = await Promise.all([
                    apiFetch<User[]>('/admin/users'),
                    apiFetch<Case[]>('/cases'),
                    apiFetch<Assignment[]>('/assignments')
                ]);
                setUsers(usersData.filter(u => u.role === 'clinician'));
                setCases(casesData);
                setAssignments(assignmentsData);
            } catch (error) {
                console.error('Failed to fetch assignment data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin() || isResearcher()) {
            fetchData();
        }
    }, [isAdmin, isResearcher]);

    const handleAssign = async () => {
        if (!selectedCase || selectedUsers.length === 0) {
            setMessage({ type: 'error', text: 'Please select a case and at least one clinician.' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            await apiFetch('/assignments', {
                method: 'POST',
                body: JSON.stringify({
                    caseId: selectedCase,
                    userIds: selectedUsers
                })
            });

            setMessage({ type: 'success', text: 'Assignments created successfully.' });

            // Refresh assignments
            const newAssignments = await apiFetch<Assignment[]>('/assignments');
            setAssignments(newAssignments);

            // Reset selection
            setSelectedUsers([]);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create assignments.' });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Assign Cases</h1>
                    <p className="text-gray-600 mt-2">Assign dermatology cases to clinicians for diagnosis.</p>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Case</label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                            value={selectedCase}
                            onChange={(e) => setSelectedCase(e.target.value)}
                        >
                            <option value="">-- Select a case --</option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.patientId} - {c.chiefComplaint}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Clinicians</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-md p-4 max-h-60 overflow-y-auto">
                            {users.map(user => {
                                const isAssigned = assignments.some(a => a.caseId === selectedCase && a.userId === user.id);
                                return (
                                    <div key={user.id} className={`flex items-center p-2 rounded hover:bg-gray-50 ${isAssigned ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            id={`user-${user.id}`}
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => toggleUser(user.id)}
                                            disabled={isAssigned}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer w-full">
                                            {user.name}
                                            <span className="text-gray-500 text-xs ml-1">({user.email})</span>
                                            {isAssigned && <span className="text-green-600 text-xs ml-2 font-bold">Assigned</span>}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleAssign}
                        disabled={submitting || !selectedCase || selectedUsers.length === 0}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Assigning...' : 'Assign Selected Clinicians'}
                    </button>
                </div>
            </div>
        </main>
    );
}
