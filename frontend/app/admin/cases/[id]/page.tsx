'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface CaseAnalytics {
    case: {
        id: string;
        patientId: string;
        groundTruthDiagnosis: string;
        imageUrl: string;
        clinicalHistory: string;
    };
    responses: Array<{
        id: string;
        diagnosis: string;
        rating: number;
        comments: string;
        timeSpentSeconds: number;
        user: {
            name: string;
            email: string;
        };
        isCorrect: boolean;
        createdAt: string;
    }>;
    stats: {
        totalResponses: number;
        accuracy: number;
        averageTimeSeconds: number;
    };
}

export default function CaseAnalyticsPage() {
    const params = useParams();
    const [data, setData] = useState<CaseAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin, isResearcher } = useAuth();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await apiFetch<CaseAnalytics>(`/admin/analytics/cases/${params.id}`);
                setData(result);
            } catch (error) {
                console.error('Failed to fetch case analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin() || isResearcher()) {
            fetchAnalytics();
        }
    }, [params.id, isAdmin, isResearcher]);

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
    if (!data) return <div className="p-8 text-center">Case not found</div>;

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Case Analysis: {data.case.patientId}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Case Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4">Ground Truth</h2>
                        <div className="mb-4">
                            <img src={data.case.imageUrl} alt="Case" className="w-full h-48 object-cover rounded mb-4" />
                            <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                            <p className="text-xl font-bold text-gray-900 mb-4">{data.case.groundTruthDiagnosis}</p>
                            <p className="text-sm text-gray-500 mb-1">History</p>
                            <p className="text-sm text-gray-700">{data.case.clinicalHistory}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4">Performance Metrics</h2>
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Responses</p>
                                <p className="text-2xl font-bold">{data.stats.totalResponses}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Accuracy</p>
                                <p className={`text-2xl font-bold ${data.stats.accuracy >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {(data.stats.accuracy * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Avg Time</p>
                                <p className="text-2xl font-bold">{Math.round(data.stats.averageTimeSeconds)}s</p>
                            </div>
                        </div>

                        <h3 className="font-bold mb-4">Clinician Responses</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Clinician</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Diagnosis</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Confidence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.responses.map((resp) => (
                                        <tr key={resp.id}>
                                            <td className="px-4 py-2 text-sm text-gray-900">{resp.user.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{resp.diagnosis}</td>
                                            <td className="px-4 py-2 text-sm">
                                                {resp.isCorrect ? (
                                                    <span className="text-green-600 font-medium">Correct</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">Incorrect</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{resp.rating}/5</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
