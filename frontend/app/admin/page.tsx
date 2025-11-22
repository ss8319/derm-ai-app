'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface OverviewMetrics {
    totalCases: number;
    totalClinicians: number;
    totalResponses: number;
    completionRate: number;
    accuracyRate: number;
    totalAssignments: number;
    completedAssignments: number;
}

interface Case {
    id: string;
    patientId: string;
    chiefComplaint: string;
    groundTruthDiagnosis: string;
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin, isResearcher } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsData, casesData] = await Promise.all([
                    apiFetch<OverviewMetrics>('/admin/analytics/overview'),
                    apiFetch<Case[]>('/cases')
                ]);
                setMetrics(metricsData);
                setCases(casesData);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin() || isResearcher()) {
            fetchData();
        }
    }, [isAdmin, isResearcher]);

    if (loading) {
        return <div className="p-8 text-center">Loading dashboard...</div>;
    }

    if (!isAdmin() && !isResearcher()) {
        return <div className="p-8 text-center text-red-600">Access Denied</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Research Dashboard</h1>
                        <p className="text-gray-600 mt-2">Platform Overview & Analytics</p>
                    </div>
                    <div className="space-x-4">
                        <Link href="/admin/assign" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            Assign Cases
                        </Link>
                    </div>
                </header>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Cases</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.totalCases}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.totalResponses}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {(metrics?.completionRate! * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {metrics?.completedAssignments} / {metrics?.totalAssignments} assignments
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Overall Accuracy</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {(metrics?.accuracyRate! * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">vs Ground Truth</p>
                    </div>
                </div>

                {/* Cases Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Case Performance</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis (Ground Truth)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cases.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.patientId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.groundTruthDiagnosis}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.chiefComplaint}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/cases/${c.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View Analytics
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
