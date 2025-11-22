'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Case } from '../../../types/case';
import { apiFetch } from '../../../lib/api';

export default function CaseDetail() {
    const { id } = useParams();
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [diagnosis, setDiagnosis] = useState('');
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [comments, setComments] = useState('');
    const [aiAssistanceEnabled, setAiAssistanceEnabled] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const data = await apiFetch<Case>(`/cases/${id}`);
                setCaseData(data);
            } catch (e) {
                setError('Failed to load case details.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMessage(null);
        try {
            await apiFetch('/responses', {
                method: 'POST',
                body: JSON.stringify({
                    diagnosis,
                    rating,
                    comments,
                    aiAssistanceEnabled,
                    timeSpentSeconds: timeSpent,
                    caseId: id,
                }),
            });
            setSubmitMessage('Success: Diagnosis submitted.');
        } catch (e: any) {
            setSubmitMessage(e.message || 'Failed to submit diagnosis.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h1>
                <p className="text-gray-600 mb-8">{error || 'The requested case could not be found.'}</p>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative h-96 lg:h-auto bg-gray-100">
                            <Image src={caseData.imageUrl} alt={`Case ${caseData.id}`} fill className="object-cover" />
                        </div>

                        {/* Details Section */}
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Case {caseData.patientId}</h1>
                                    <p className="text-gray-500 mt-1">
                                        {caseData.age} years • {caseData.gender}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">New Case</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Clinical History</h3>
                                    <p className="text-gray-700 leading-relaxed">{caseData.clinicalHistory}</p>
                                </div>

                                {caseData.prediction && (
                                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                        <h3 className="text-sm font-medium text-indigo-900 uppercase tracking-wider mb-3">AI Analysis</h3>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-indigo-700 font-medium">Predicted Condition</span>
                                            <span className="text-indigo-900 font-bold">{caseData.prediction.condition}</span>
                                        </div>
                                        <div className="w-full bg-indigo-200 rounded-full h-2.5">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${caseData.prediction.confidence * 100}%` }}></div>
                                        </div>
                                        <div className="mt-1 text-right text-xs text-indigo-600 font-medium">
                                            {Math.round(caseData.prediction.confidence * 100)}% Confidence
                                        </div>
                                    </div>
                                )}

                                {/* Clinician Response Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Diagnosis *</label>
                                        <input type="text" required className="mt-1 w-full border rounded p-2" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium">Rating (1‑5)</label>
                                            <input type="number" min={1} max={5} className="mt-1 w-full border rounded p-2" value={rating ?? ''} onChange={e => setRating(e.target.value ? Number(e.target.value) : undefined)} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium">Time Spent (seconds)</label>
                                            <input type="number" min={0} className="mt-1 w-full border rounded p-2" value={timeSpent} onChange={e => setTimeSpent(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Comments</label>
                                        <textarea className="mt-1 w-full border rounded p-2" rows={3} value={comments} onChange={e => setComments(e.target.value)} />
                                    </div>
                                    <div className="flex items-center">
                                        <input type="checkbox" id="aiAssist" checked={aiAssistanceEnabled} onChange={e => setAiAssistanceEnabled(e.target.checked)} className="mr-2" />
                                        <label htmlFor="aiAssist" className="text-sm">Enable AI assistance</label>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors">Submit Diagnosis</button>
                                    {submitMessage && (
                                        <p className={`mt-2 text-sm ${submitMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>{submitMessage}</p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
